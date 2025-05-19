import { Component, OnInit } from '@angular/core';
import { AccountService } from '../shared/services/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Account } from '../shared/models/account.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  accounts: Account[] = [];
  loading = true;
  userName = '';

  constructor(
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadAccounts();
  }

  loadUserData(): void {
    // Get user details from localStorage or a user service
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userName = user.firstName ? `${user.firstName} ${user.lastName}` : 'Customer';
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load account information', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  viewAccountDetails(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }

  viewMiniStatement(accountId: number): void {
    this.router.navigate(['/accounts', accountId, 'mini-statement']);
  }

  viewDetailedStatement(accountId: number): void {
    this.router.navigate(['/accounts', accountId, 'detailed-statement']);
  }

  navigateToChequeDeposit(): void {
    this.router.navigate(['/cheque-deposit']);
  }

  navigateToBillPayment(): void {
    this.router.navigate(['/bill-payment']);
  }

  navigateToMoneyTransfer(): void {
    this.router.navigate(['/money-transfer']);
  }
  
  getAccountBalance(account: Account): string {
    return account.balance.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  }
  
  getAccountTypeLabel(type: string): string {
    switch (type) {
      case 'SAVINGS':
        return 'Savings Account';
      case 'CURRENT':
        return 'Current Account';
      case 'FIXED_DEPOSIT':
        return 'Fixed Deposit';
      default:
        return type;
    }
  }
}
