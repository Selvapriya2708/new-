import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../core/models/account.model';
import { Transaction } from '../../core/models/transaction.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  totalBalance: number = 0;
  loading: boolean = true;
  error: string = '';

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    this.accountService.getAllAccounts()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.calculateTotalBalance();
          this.loadRecentTransactions();
        },
        error: (err) => {
          this.error = 'Failed to load account data. Please try again later.';
          console.error('Error loading accounts:', err);
        }
      });
  }

  loadRecentTransactions(): void {
    if (this.accounts.length > 0) {
      // Get recent transactions for the first account
      const primaryAccountId = this.accounts[0].id;
      
      this.transactionService.getMiniStatement(primaryAccountId)
        .subscribe({
          next: (transactions) => {
            this.recentTransactions = transactions;
          },
          error: (err) => {
            console.error('Error loading recent transactions:', err);
          }
        });
    }
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.accounts.reduce((total, account) => total + account.balance, 0);
  }

  getAccountTypeIcon(accountType: string): string {
    switch (accountType) {
      case 'SAVINGS':
        return 'piggy-bank';
      case 'CURRENT':
        return 'credit-card';
      case 'FIXED_DEPOSIT':
        return 'lock';
      default:
        return 'dollar-sign';
    }
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'DEPOSIT':
        return 'arrow-down-circle';
      case 'WITHDRAWAL':
        return 'arrow-up-circle';
      case 'TRANSFER':
        return 'repeat';
      case 'BILL_PAYMENT':
        return 'file-text';
      case 'CHEQUE_DEPOSIT':
        return 'check-square';
      default:
        return 'activity';
    }
  }

  getTransactionClass(type: string): string {
    switch (type) {
      case 'DEPOSIT':
      case 'CHEQUE_DEPOSIT':
        return 'transaction-credit';
      case 'WITHDRAWAL':
      case 'TRANSFER':
      case 'BILL_PAYMENT':
        return 'transaction-debit';
      default:
        return '';
    }
  }

  getAmountClass(type: string): string {
    switch (type) {
      case 'DEPOSIT':
      case 'CHEQUE_DEPOSIT':
        return 'amount-credit';
      case 'WITHDRAWAL':
      case 'TRANSFER':
      case 'BILL_PAYMENT':
        return 'amount-debit';
      default:
        return '';
    }
  }

  formatAmount(type: string, amount: number): string {
    switch (type) {
      case 'DEPOSIT':
      case 'CHEQUE_DEPOSIT':
        return `+${amount.toFixed(2)}`;
      case 'WITHDRAWAL':
      case 'TRANSFER':
      case 'BILL_PAYMENT':
        return `-${amount.toFixed(2)}`;
      default:
        return amount.toFixed(2);
    }
  }
}
