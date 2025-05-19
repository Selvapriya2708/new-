import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account, AccountType, SavingsAccount, CurrentAccount } from '../../core/models/account.model';
import { Transaction } from '../../core/models/transaction.model';
import { switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss']
})
export class AccountDetailComponent implements OnInit {
  account: Account | null = null;
  savingsAccount: SavingsAccount | null = null;
  currentAccount: CurrentAccount | null = null;
  recentTransactions: Transaction[] = [];
  loading = true;
  error = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAccountDetails();
  }

  loadAccountDetails(): void {
    this.loading = true;
    this.error = false;
    
    const accountId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (isNaN(accountId)) {
      this.error = true;
      this.loading = false;
      this.snackBar.open('Invalid account ID', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.accountService.getAccount(accountId)
      .pipe(
        switchMap(account => {
          this.account = account;
          
          // Based on account type, fetch additional details
          if (account.accountType === AccountType.SAVINGS) {
            return this.accountService.getSavingsAccount(accountId).pipe(
              catchError(error => {
                this.snackBar.open(`Error loading savings account details: ${error.message}`, 'Close', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
                return of(null);
              })
            );
          } else if (account.accountType === AccountType.CURRENT) {
            return this.accountService.getCurrentAccount(accountId).pipe(
              catchError(error => {
                this.snackBar.open(`Error loading current account details: ${error.message}`, 'Close', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
                return of(null);
              })
            );
          }
          
          return of(null);
        }),
        switchMap(specialAccount => {
          if (specialAccount) {
            if (this.account?.accountType === AccountType.SAVINGS) {
              this.savingsAccount = specialAccount as SavingsAccount;
            } else if (this.account?.accountType === AccountType.CURRENT) {
              this.currentAccount = specialAccount as CurrentAccount;
            }
          }
          
          // Fetch recent transactions
          return this.transactionService.getMiniStatement(accountId).pipe(
            catchError(error => {
              this.snackBar.open(`Error loading recent transactions: ${error.message}`, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
              return of([]);
            })
          );
        }),
        catchError(error => {
          this.error = true;
          this.snackBar.open(`Error loading account details: ${error.message}`, 'Close', {
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

  formatPercent(rate: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(rate / 100);
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
