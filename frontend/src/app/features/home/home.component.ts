import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { User } from '../../core/models/user.model';
import { Account, AccountType } from '../../core/models/account.model';
import { Transaction } from '../../core/models/transaction.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  accounts: Account[] = [];
  recentTransactions: { [accountId: number]: Transaction[] } = {};
  isLoading = true;
  
  // Total balance
  totalBalance = 0;
  
  // Account type grouping
  savingsAccounts: Account[] = [];
  currentAccounts: Account[] = [];
  fixedDepositAccounts: Account[] = [];
  
  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadAccounts();
    });
  }
  
  loadAccounts(): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe({
      next: accounts => {
        this.accounts = accounts;
        this.categorizeAccounts();
        this.calculateTotalBalance();
        this.loadRecentTransactions();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  
  categorizeAccounts(): void {
    this.savingsAccounts = this.accounts.filter(account => account.accountType === AccountType.SAVINGS);
    this.currentAccounts = this.accounts.filter(account => account.accountType === AccountType.CURRENT);
    this.fixedDepositAccounts = this.accounts.filter(account => account.accountType === AccountType.FIXED_DEPOSIT);
  }
  
  calculateTotalBalance(): void {
    this.totalBalance = this.accounts.reduce((total, account) => total + account.balance, 0);
  }
  
  loadRecentTransactions(): void {
    let completedCount = 0;
    
    if (this.accounts.length === 0) {
      this.isLoading = false;
      return;
    }
    
    this.accounts.forEach(account => {
      this.transactionService.getMiniStatement(account.id).subscribe({
        next: statement => {
          this.recentTransactions[account.id] = statement.transactions;
          completedCount++;
          
          if (completedCount === this.accounts.length) {
            this.isLoading = false;
          }
        },
        error: () => {
          completedCount++;
          
          if (completedCount === this.accounts.length) {
            this.isLoading = false;
          }
        }
      });
    });
  }
  
  viewAccountDetails(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }
  
  navigateToTransactions(accountId: number): void {
    this.router.navigate(['/transactions', accountId]);
  }
  
  navigateToNewAccount(): void {
    this.router.navigate(['/accounts/new']);
  }
  
  getAccountTypeLabel(type: string): string {
    switch (type) {
      case AccountType.SAVINGS:
        return 'Savings Account';
      case AccountType.CURRENT:
        return 'Current Account';
      case AccountType.FIXED_DEPOSIT:
        return 'Fixed Deposit';
      default:
        return 'Unknown Account Type';
    }
  }
  
  getTransactionColor(amount: number): string {
    return amount < 0 ? 'red' : 'green';
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
