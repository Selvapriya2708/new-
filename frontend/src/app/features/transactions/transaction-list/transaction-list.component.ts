import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { Transaction, TransactionType, TransactionStatus } from '../../../core/models/transaction.model';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  accountId: number = 0;
  account: Account | null = null;
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading = true;
  
  displayedColumns: string[] = ['transactionDate', 'transactionType', 'description', 'reference', 'status', 'amount', 'balance'];
  dataSource = new MatTableDataSource<Transaction>([]);
  
  filterForm: FormGroup;
  
  transactionTypes = Object.values(TransactionType);
  transactionStatuses = Object.values(TransactionStatus);
  
  // Running balance calculation
  runningBalances: { [transactionId: number]: number } = {};
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Date range for detailed statement
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {
    this.filterForm = this.formBuilder.group({
      startDate: [null],
      endDate: [null],
      transactionType: [''],
      status: [''],
      minAmount: [null],
      maxAmount: [null],
      searchText: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.accountId = +params['accountId'];
      
      // Check if there are query params for date range
      this.route.queryParams.subscribe(queryParams => {
        if (queryParams['startDate']) {
          this.startDate = new Date(queryParams['startDate']);
          this.filterForm.patchValue({ startDate: this.startDate });
        }
        
        if (queryParams['endDate']) {
          this.endDate = new Date(queryParams['endDate']);
          this.filterForm.patchValue({ endDate: this.endDate });
        }
      });
      
      this.loadAccountDetails();
      this.loadTransactions();
    });
    
    // Set up filter form changes listener
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }
  
  loadAccountDetails(): void {
    this.accountService.getAccountById(this.accountId).subscribe({
      next: account => {
        this.account = account;
      },
      error: error => {
        this.snackBar.open(`Error loading account details: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  loadTransactions(): void {
    this.isLoading = true;
    
    if (this.startDate && this.endDate) {
      // Load detailed statement for date range
      const request = {
        accountId: this.accountId,
        startDate: this.startDate,
        endDate: this.endDate
      };
      
      this.transactionService.getDetailedStatement(request).subscribe({
        next: statement => {
          this.transactions = statement.transactions;
          this.calculateRunningBalances(statement.openingBalance);
          this.filteredTransactions = [...this.transactions];
          this.updateDataSource();
          this.isLoading = false;
        },
        error: error => {
          this.isLoading = false;
          this.snackBar.open(`Error loading transactions: ${error.message}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Load all transactions
      this.transactionService.getTransactionsByAccount(this.accountId).subscribe({
        next: transactions => {
          this.transactions = transactions;
          this.calculateRunningBalances();
          this.filteredTransactions = [...this.transactions];
          this.updateDataSource();
          this.isLoading = false;
        },
        error: error => {
          this.isLoading = false;
          this.snackBar.open(`Error loading transactions: ${error.message}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
  
  calculateRunningBalances(openingBalance?: number): void {
    let balance = openingBalance || (this.account ? this.account.balance : 0);
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...this.transactions].sort((a, b) => 
      new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );
    
    // Calculate backwards from current balance
    for (const transaction of sortedTransactions) {
      this.runningBalances[transaction.id] = balance;
      balance -= transaction.amount; // Subtract because we're going backwards
    }
  }
  
  updateDataSource(): void {
    this.dataSource = new MatTableDataSource<Transaction>(this.filteredTransactions);
    
    // Add sorting and pagination after data is loaded
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      
      // Custom sort for date
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'transactionDate':
            return new Date(item.transactionDate).getTime();
          default:
            return (item as any)[property];
        }
      };
    });
  }
  
  applyFilter(): void {
    const filterValue = this.filterForm.value;
    
    this.filteredTransactions = this.transactions.filter(transaction => {
      // Date range filter
      if (filterValue.startDate && new Date(transaction.transactionDate) < filterValue.startDate) {
        return false;
      }
      
      if (filterValue.endDate) {
        const endDatePlusOne = new Date(filterValue.endDate);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
        
        if (new Date(transaction.transactionDate) >= endDatePlusOne) {
          return false;
        }
      }
      
      // Transaction type filter
      if (filterValue.transactionType && transaction.transactionType !== filterValue.transactionType) {
        return false;
      }
      
      // Status filter
      if (filterValue.status && transaction.status !== filterValue.status) {
        return false;
      }
      
      // Amount range filter
      if (filterValue.minAmount && transaction.amount < filterValue.minAmount) {
        return false;
      }
      
      if (filterValue.maxAmount && transaction.amount > filterValue.maxAmount) {
        return false;
      }
      
      // Text search filter
      if (filterValue.searchText) {
        const searchText = filterValue.searchText.toLowerCase();
        return transaction.description.toLowerCase().includes(searchText) ||
               transaction.reference.toLowerCase().includes(searchText);
      }
      
      return true;
    });
    
    this.updateDataSource();
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
      transactionType: '',
      status: '',
      minAmount: null,
      maxAmount: null,
      searchText: ''
    });
    this.filteredTransactions = [...this.transactions];
    this.updateDataSource();
  }
  
  getTransactionTypeLabel(type: string): string {
    return type.replace('_', ' ');
  }
  
  getTransactionStatusLabel(status: string): string {
    return status.replace('_', ' ');
  }
  
  getTransactionColor(amount: number): string {
    return amount < 0 ? 'red' : 'green';
  }
  
  getTransactionStatusClass(status: string): string {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'status-completed';
      case TransactionStatus.PENDING:
        return 'status-pending';
      case TransactionStatus.FAILED:
        return 'status-failed';
      case TransactionStatus.SCHEDULED:
        return 'status-scheduled';
      default:
        return '';
    }
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
