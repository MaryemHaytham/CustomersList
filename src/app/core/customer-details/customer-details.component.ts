import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Customer } from 'src/app/models/Customer';
import { allTransaction, Transaction } from 'src/app/models/Transaction';
import { DataService } from 'src/app/service/data.service';
import { TransactionGraphComponent } from '../transaction-graph/transaction-graph.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit {
  totalCount: number = 0;
  customers: Customer[] = [];
  transactions: Transaction[] = [];
  filteredCustomers: Customer[] = [];
  selectedCustomerTransactions: allTransaction = [];
  page: number = 1;
  customerSearchInput = '';
  customerTransactionAmounts: { [key: number]: number } = {};

  displayedColumns: string[] = ['name', 'totalAmount', 'actions'];
  dataSource = new MatTableDataSource<Customer>();

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  constructor(private customerService: DataService,private dialog:MatDialog) {}

  ngOnInit(): void {
    this.getCustomers()
    this.getTransactions()
    this.onPageChange(this.page) 
  }

  getTransactions(){
    this.customerService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.calculateTransactionAmounts();
    });

  }
  getCustomers(){
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
      this.filteredCustomers = this.customers;
      this.calculateTransactionAmounts();
      this.dataSource = new MatTableDataSource(this.filteredCustomers);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

  }

  calculateTransactionAmounts(): void {
    this.customerTransactionAmounts = this.customers.reduce((acc, customer) => {
      const totalAmount = this.transactions
        .filter(transaction => transaction.customer_id === +customer.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      acc[customer.id] = totalAmount;
      return acc;
    }, {} as { [key: string]: number });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  

  selectCustomer(customerId: string): void {
    this.selectedCustomerTransactions = this.transactions.filter(transaction => transaction.customer_id === +customerId);
  
    const dialogRef = this.dialog.open(TransactionGraphComponent, {
      width: '60%',
      data: {
        transactions: this.selectedCustomerTransactions,
        id: customerId
      }
    });
  
    dialogRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        dialogRef.componentInstance?.renderChart();
      }, 0);
    });
  }
  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.getCustomers()
    this.getTransactions()
  }
  
}