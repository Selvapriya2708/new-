import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../shared/services/account.service';
import { Account } from '../../shared/models/account.model';

@Component({
  selector: 'app-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss']
})
export class AccountsListComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  loading = true;
  selectedType = 'ALL';
  accountTypes = [
    { value: 'ALL', label: 'All Accounts' },
    { value: 'SAVINGS', label: 'Savings Accounts' },
    { value: 'CURRENT', label: 'Current Accounts' },
    { value: 'FIXED_DEPOSIT', label: 'Fixed Deposits' }
  ];

  constructor(
    private accountService: AccountService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.filteredAccounts = [...this.accounts];
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load accounts', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  filterAccountsByType(type: string): void {
    this.selectedType = type;
    
    if (type === 'ALL') {
      this.filteredAccounts = [...this.accounts];
    } else {
      this.filteredAccounts = this.accounts.filter(account => account.type === type);
    }
  }

  navigateToAccountDetail(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }

  navigateToMiniStatement(accountId: number): void {
    this.router.navigate(['/accounts', accountId, 'mini-statement']);
  }

  navigateToDetailedStatement(accountId: number): void {
    this.router.navigate(['/accounts', accountId, 'detailed-statement']);
  }

  requestNewAccount(): void {
    // Show a dialog or navigate to a form for requesting a new account
    // For now, we'll just show a notification
    this.snackBar.open('New account request feature coming soon!', 'Close', {
      duration: 3000
    });
  }

  getTotalBalance(): number {
    return this.accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  getFormattedBalance(balance: number): string {
    return balance.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  }

  getAccountTypeLabel(type: string): string {
    const found = this.accountTypes.find(t => t.value === type);
    return found ? found.label : type;
  }
}
