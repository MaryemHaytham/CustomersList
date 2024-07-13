import { AfterViewInit, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Chart, registerables } from 'chart.js';
import { allTransaction } from 'src/app/models/Transaction';

@Component({
  selector: 'app-transaction-graph',
  template: `
    <div class="w-100 text-center">
      <canvas #canvas id="dialogChart"></canvas>
    </div>
    <button class="btn outline-main" (click)="closeDialog()">Close</button>
  `,
  styleUrls: ['./transaction-graph.component.scss']
})
export class TransactionGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;
  transactions:  any[] = [];

  constructor(

    private dialogRef:MatDialogRef<TransactionGraphComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.transactions = data.transactions;
    }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderChart();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy(); 
    }
  }

  renderChart(): void {
    if (!this.canvasRef || !this.canvasRef.nativeElement) {
      console.error('Canvas element not found or not initialized.');
      return;
    }

    const labels = this.data.transactions.map((transaction: any) => transaction.date);
    const data = this.data.transactions.map((transaction: any) => transaction.amount);

    Chart.register(...registerables);

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (ctx) {
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Transactions',
            data: data,
            fill: false,
            borderColor: '#3252dfda',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    } else {
      console.error('Canvas context not available.');
    }
  }
  closeDialog(): void {
    this.dialogRef.close()
  }
}