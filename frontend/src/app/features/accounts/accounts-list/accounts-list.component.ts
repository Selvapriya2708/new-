import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { Account, AccountType, AccountStatus } from '../../../core/models/account.model';

@Component({
  selector: 'app-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss']
})
export class AccountsListComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  isLoading = true;
  
  // Account type for filtering
  accountTypeFilter: string = 'ALL';
  
  // Account type grouping
  savingsAccounts: Account[] = [];
  currentAccounts: Account[] = [];
  fixedDepositAccounts: Account[] = [];
  
  // Interest rates
  savingsInterestRate: number = 0;
  currentOverdraftRate: number = 0;
  fixedDepositRates: { [key: number]: number } = {};
  
  constructor(
    private accountService: AccountService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadInterestRates();
  }
  
  loadAccounts(): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe({
      next: accounts => {
        this.accounts = accounts;
        this.filteredAccounts = accounts;
        this.categorizeAccounts();
        this.isLoading = false;
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
  
  loadInterestRates(): void {
    this.accountService.getSavingsInterestRate().subscribe(
      data => this.savingsInterestRate = data.rate
    );
    
    this.accountService.getCurrentOverdraftRate().subscribe(
      data => this.currentOverdraftRate = data.rate
    );
    
    this.accountService.getFixedDepositRates().subscribe(
      data => this.fixedDepositRates = data
    );
  }
  
  filterAccounts(type: string): void {
    this.accountTypeFilter = type;
    
    if (type === 'ALL') {
      this.filteredAccounts = this.accounts;
    } else {
      this.filteredAccounts = this.accounts.filter(account => account.accountType === type);
    }
  }
  
  viewAccountDetails(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
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
  
  getAccountStatusLabel(status: string): string {
    switch (status) {
      case AccountStatus.ACTIVE:
        return 'Active';
      case AccountStatus.INACTIVE:
        return 'Inactive';
      case AccountStatus.PENDING:
        return 'Pending';
      case AccountStatus.CLOSED:
        return 'Closed';
      default:
        return 'Unknown Status';
    }
  }
  
  getAccountStatusClass(status: string): string {
    switch (status) {
      case AccountStatus.ACTIVE:
        return 'status-active';
      case AccountStatus.INACTIVE:
        return 'status-inactive';
      case AccountStatus.PENDING:
        return 'status-pending';
      case AccountStatus.CLOSED:
        return 'status-closed';
      default:
        return '';
    }
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
  
  formatInterestRate(rate: number): string {
    return `${rate.toFixed(2)}%`;
  }
}
