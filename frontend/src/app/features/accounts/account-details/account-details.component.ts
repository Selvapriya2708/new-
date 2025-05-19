import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Account, AccountType, SavingsAccount, CurrentAccount, FixedDepositAccount } from '../../../core/models/account.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent implements OnInit {
  accountId: number = 0;
  account: Account | null = null;
  savingsAccount: SavingsAccount | null = null;
  currentAccount: CurrentAccount | null = null;
  fixedDepositAccount: FixedDepositAccount | null = null;
  miniStatement: Transaction[] = [];
  isLoading = true;
  accountType: string = '';
  
  // Date range for detailed statement
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.accountId = +params['id'];
      this.loadAccountDetails();
    });
  }
  
  loadAccountDetails(): void {
    this.isLoading = true;
    
    this.accountService.getAccountById(this.accountId).subscribe({
      next: account => {
        this.account = account;
        this.accountType = account.accountType;
        
        // Load specific account type details
        this.loadAccountTypeDetails();
        
        // Load mini statement
        this.loadMiniStatement();
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open(`Error loading account details: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  loadAccountTypeDetails(): void {
    if (!this.account) return;
    
    switch (this.account.accountType) {
      case AccountType.SAVINGS:
        this.accountService.getSavingsAccount(this.accountId).subscribe({
          next: savingsAccount => {
            this.savingsAccount = savingsAccount;
          },
          error: () => {
            // Handle error if needed
          }
        });
        break;
        
      case AccountType.CURRENT:
        this.accountService.getCurrentAccount(this.accountId).subscribe({
          next: currentAccount => {
            this.currentAccount = currentAccount;
          },
          error: () => {
            // Handle error if needed
          }
        });
        break;
        
      case AccountType.FIXED_DEPOSIT:
        this.accountService.getFixedDepositAccount(this.accountId).subscribe({
          next: fixedDepositAccount => {
            this.fixedDepositAccount = fixedDepositAccount;
          },
          error: () => {
            // Handle error if needed
          }
        });
        break;
    }
  }
  
  loadMiniStatement(): void {
    this.transactionService.getMiniStatement(this.accountId).subscribe({
      next: statement => {
        this.miniStatement = statement.transactions;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  
  generateDetailedStatement(): void {
    if (!this.startDate || !this.endDate) {
      this.snackBar.open('Please select both start and end dates', 'Close', {
        duration: 3000
      });
      return;
    }
    
    const request = {
      accountId: this.accountId,
      startDate: this.startDate,
      endDate: this.endDate
    };
    
    this.router.navigate(['/transactions', this.accountId], {
      queryParams: {
        startDate: this.startDate.toISOString(),
        endDate: this.endDate.toISOString()
      }
    });
  }
  
  navigateToTransactions(): void {
    this.router.navigate(['/transactions', this.accountId]);
  }
  
  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return '';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
  
  formatInterestRate(rate: number | undefined): string {
    if (rate === undefined) return '';
    return `${rate.toFixed(2)}%`;
  }
  
  getTransactionColor(amount: number): string {
    return amount < 0 ? 'red' : 'green';
  }
  
  getAccountTypeLabel(type: string | undefined): string {
    if (!type) return '';
    
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
}
