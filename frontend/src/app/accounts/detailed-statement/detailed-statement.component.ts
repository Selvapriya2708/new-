import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../core/models/account.model';
import { Transaction, TransactionType } from '../../core/models/transaction.model';
import { switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-detailed-statement',
  templateUrl: './detailed-statement.component.html',
  styleUrls: ['./detailed-statement.component.scss']
})
export class DetailedStatementComponent implements OnInit {
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  selectedAccount: Account | null = null;
  loading = true;
  error = false;
  
  statementForm: FormGroup;
  displayedColumns: string[] = ['date', 'description', 'reference', 'transactionType', 'amount', 'balance'];
  
  transactionTypes = Object.values(TransactionType);
  selectedTransactionType: string | null = null;
  filterDescription: string = '';
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {
    // Initialize form with default date range (last 30 days)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    
    this.statementForm = this.fb.group({
      accountId: ['', Validators.required],
      fromDate: [lastMonth, Validators.required],
      toDate: [today, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    
    // Check for query params
    this.route.queryParams.subscribe(params => {
      if (params['accountId']) {
        this.statementForm.patchValue({ accountId: params['accountId'] });
      }
    });
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = false;
    
    this.accountService.getAccounts()
      .pipe(
        catchError(error => {
          this.error = true;
          this.snackBar.open(`Error loading accounts: ${error.message}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return of([]);
        })
      )
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts.filter(account => account.accountType !== 'FIXED_DEPOSIT');
          this.loading = false;
          
          // If accountId is already set in the form, load statement
          const accountId = this.statementForm.get('accountId')?.value;
          if (accountId) {
            this.selectedAccount = this.accounts.find(acc => acc.id.toString() === accountId) || null;
            this.getDetailedStatement();
          }
        },
        error: () => {
          this.loading = false;
          this.error = true;
        }
      });
  }

  getDetailedStatement(): void {
    if (this.statementForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = false;
    
    const formValues = this.statementForm.value;
    const accountId = parseInt(formValues.accountId, 10);
    
    this.selectedAccount = this.accounts.find(acc => acc.id === accountId) || null;
    
    this.transactionService.getDetailedStatement(accountId, formValues.fromDate, formValues.toDate)
      .pipe(
        catchError(error => {
          this.error = true;
          this.snackBar.open(`Error loading transactions: ${error.message}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return of([]);
        })
      )
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.filteredTransactions = [...transactions];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
        }
      });
  }

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      let matchesType = true;
      let matchesDescription = true;
      
      if (this.selectedTransactionType) {
        matchesType = transaction.transactionType === this.selectedTransactionType;
      }
      
      if (this.filterDescription) {
        matchesDescription = transaction.description.toLowerCase().includes(this.filterDescription.toLowerCase());
      }
      
      return matchesType && matchesDescription;
    });
  }

  resetFilters(): void {
    this.selectedTransactionType = null;
    this.filterDescription = '';
    this.filteredTransactions = [...this.transactions];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatTransactionType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

  getAccountTypeName(type: string): string {
    switch (type) {
      case 'SAVINGS': return 'Savings Account';
      case 'CURRENT': return 'Current Account';
      case 'FIXED_DEPOSIT': return 'Fixed Deposit';
      default: return type;
    }
  }

  exportStatement(): void {
    // This would ideally trigger a backend call to generate a PDF or CSV
    this.snackBar.open('Statement export functionality will be available soon.', 'Close', {
      duration: 3000
    });
  }
}
