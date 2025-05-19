import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../core/models/account.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {
  savingsAccounts: Account[] = [];
  currentAccounts: Account[] = [];
  fixedDeposits: Account[] = [];
  loading = true;
  error = '';
  savingsInterestRate: number = 0;
  currentOverdraftRate: number = 0;

  constructor(
    private accountService: AccountService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadInterestRates();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = '';

    this.accountService.getAllAccounts()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (accounts) => {
          this.categorizeAccounts(accounts);
        },
        error: (err) => {
          this.error = 'Failed to load accounts. Please try again later.';
          console.error('Error loading accounts:', err);
        }
      });
  }

  loadInterestRates(): void {
    this.accountService.getInterestRate('SAVINGS')
      .subscribe(data => this.savingsInterestRate = data.rate);
      
    this.accountService.getInterestRate('CURRENT')
      .subscribe(data => this.currentOverdraftRate = data.rate);
  }

  categorizeAccounts(accounts: Account[]): void {
    this.savingsAccounts = accounts.filter(a => a.accountType === 'SAVINGS');
    this.currentAccounts = accounts.filter(a => a.accountType === 'CURRENT');
    this.fixedDeposits = accounts.filter(a => a.accountType === 'FIXED_DEPOSIT');
  }

  viewAccountDetails(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }

  requestNewAccount(): void {
    // Open modal or navigate to create account page
    console.log('Request new account functionality to be implemented');
  }

  getTotalBalance(accounts: Account[]): number {
    return accounts.reduce((total, account) => total + account.balance, 0);
  }

  getAccountStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success';
      case 'INACTIVE':
        return 'bg-danger';
      case 'PENDING_APPROVAL':
        return 'bg-warning';
      case 'CLOSED':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  }
}
