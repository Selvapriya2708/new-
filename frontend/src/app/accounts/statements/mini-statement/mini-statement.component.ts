import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../../shared/services/account.service';
import { TransactionService } from '../../../shared/services/transaction.service';
import { Account } from '../../../shared/models/account.model';
import { Transaction } from '../../../shared/models/transaction.model';

@Component({
  selector: 'app-mini-statement',
  templateUrl: './mini-statement.component.html',
  styleUrls: ['./mini-statement.component.scss']
})
export class MiniStatementComponent implements OnInit {
  accountId: number;
  account: Account;
  transactions: Transaction[] = [];
  loading = true;
  transactionsLoading = true;
  displayedColumns: string[] = ['date', 'description', 'reference', 'amount', 'balance'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.accountId = +params.get('id');
      this.loadAccountDetails();
      this.loadMiniStatement();
    });
  }

  loadAccountDetails(): void {
    this.loading = true;
    this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.account = account;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load account details', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
        this.router.navigate(['/accounts']);
      }
    });
  }

  loadMiniStatement(): void {
    this.transactionsLoading = true;
    this.transactionService.getMiniStatement(this.accountId).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.transactionsLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load mini statement', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.transactionsLoading = false;
      }
    });
  }

  navigateToDetailedStatement(): void {
    this.router.navigate(['/accounts', this.accountId, 'detailed-statement']);
  }

  navigateToAccountDetail(): void {
    this.router.navigate(['/accounts', this.accountId]);
  }

  printStatement(): void {
    window.print();
  }

  getFormattedBalance(balance: number): string {
    return balance.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  }

  getFormattedAmount(amount: number): string {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  }

  isCredit(type: string): boolean {
    return ['DEPOSIT', 'TRANSFER_IN', 'INTEREST_CREDIT', 'CHEQUE_DEPOSIT'].includes(type);
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
