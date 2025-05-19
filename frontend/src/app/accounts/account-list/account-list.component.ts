import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../core/services/account.service';
import { Account, AccountType } from '../../core/models/account.model';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  loading = true;
  error = false;
  accountType: AccountType | null = null;
  
  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      if (data['accountType']) {
        this.accountType = data['accountType'] as AccountType;
      }
      this.loadAccounts();
    });
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = false;

    const request = this.accountType 
      ? this.accountService.getAccountsByType(this.accountType)
      : this.accountService.getAccounts();

    request.subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.filteredAccounts = accounts;
        this.loading = false;
      },
      error: (error) => {
        this.error = true;
        this.loading = false;
        this.snackBar.open(`Error loading accounts: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openNewAccountDialog(): void {
    const dialogRef = this.dialog.open(NewAccountDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.requestNewAccount(result.accountType);
      }
    });
  }

  requestNewAccount(accountType: AccountType): void {
    this.accountService.requestNewAccount({ accountType }).subscribe({
      next: () => {
        this.snackBar.open('Account request submitted successfully. It will be reviewed by the bank.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.snackBar.open(`Error requesting new account: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
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

  getAccountTypeIcon(type: string): string {
    switch (type) {
      case 'SAVINGS': return 'savings';
      case 'CURRENT': return 'account_balance_wallet';
      case 'FIXED_DEPOSIT': return 'local_atm';
      default: return 'account_balance';
    }
  }
}

@Component({
  selector: 'new-account-dialog',
  template: `
    <h2 mat-dialog-title>Request New Account</h2>
    <mat-dialog-content>
      <p>Select the type of account you want to open:</p>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Account Type</mat-label>
        <mat-select [(ngModel)]="selectedAccountType">
          <mat-option [value]="'SAVINGS'">Savings Account</mat-option>
          <mat-option [value]="'CURRENT'">Current Account</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="{accountType: selectedAccountType}" [disabled]="!selectedAccountType">Submit</button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; }']
})
export class NewAccountDialogComponent {
  selectedAccountType: AccountType | null = null;
}
