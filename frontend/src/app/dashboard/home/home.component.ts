import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../core/models/account.model';
import { Transaction } from '../../core/models/transaction.model';
import { switchMap, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  totalBalance: number = 0;
  savingsBalance: number = 0;
  currentBalance: number = 0;
  fdBalance: number = 0;
  loading = true;
  error = false;

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = false;

    this.accountService.getAccounts()
      .pipe(
        switchMap(accounts => {
          this.accounts = accounts;
          
          // Calculate balances
          this.totalBalance = accounts.reduce((total, account) => total + account.balance, 0);
          this.savingsBalance = accounts
            .filter(account => account.accountType === 'SAVINGS')
            .reduce((total, account) => total + account.balance, 0);
          this.currentBalance = accounts
            .filter(account => account.accountType === 'CURRENT')
            .reduce((total, account) => total + account.balance, 0);
          this.fdBalance = accounts
            .filter(account => account.accountType === 'FIXED_DEPOSIT')
            .reduce((total, account) => total + account.balance, 0);
          
          // If accounts exist, get recent transactions for the first account
          if (accounts.length > 0) {
            return this.transactionService.getMiniStatement(accounts[0].id);
          }
          return of([]);
        }),
        catchError(error => {
          this.error = true;
          this.snackBar.open('Failed to load dashboard data: ' + error.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return of([]);
        })
      )
      .subscribe({
        next: (transactions) => {
          this.recentTransactions = transactions;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
        }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  getAccountTypeName(type: string): string {
    switch (type) {
      case 'SAVINGS': return 'Savings Account';
      case 'CURRENT': return 'Current Account';
      case 'FIXED_DEPOSIT': return 'Fixed Deposit';
      default: return type;
    }
  }
}
