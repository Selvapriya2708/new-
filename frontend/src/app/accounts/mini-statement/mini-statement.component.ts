import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../core/models/account.model';
import { Transaction } from '../../core/models/transaction.model';
import { switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-mini-statement',
  templateUrl: './mini-statement.component.html',
  styleUrls: ['./mini-statement.component.scss']
})
export class MiniStatementComponent implements OnInit {
  account: Account | null = null;
  transactions: Transaction[] = [];
  loading = true;
  error = false;
  displayedColumns: string[] = ['date', 'description', 'reference', 'amount', 'balance'];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadMiniStatement();
  }

  loadMiniStatement(): void {
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
          return this.transactionService.getMiniStatement(accountId);
        }),
        catchError(error => {
          this.error = true;
          this.snackBar.open(`Error loading mini statement: ${error.message}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return of([]);
        })
      )
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
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

  navigateToDetailedStatement(): void {
    if (this.account) {
      this.router.navigate(['/accounts/detailed-statement'], {
        queryParams: { accountId: this.account.id }
      });
    }
  }
}
