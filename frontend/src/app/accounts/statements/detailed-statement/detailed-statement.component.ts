import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../../shared/services/account.service';
import { TransactionService } from '../../../shared/services/transaction.service';
import { Account } from '../../../shared/models/account.model';
import { Transaction } from '../../../shared/models/transaction.model';

@Component({
  selector: 'app-detailed-statement',
  templateUrl: './detailed-statement.component.html',
  styleUrls: ['./detailed-statement.component.scss']
})
export class DetailedStatementComponent implements OnInit {
  accountId: number;
  account: Account;
  transactions: Transaction[] = [];
  filterForm: FormGroup;
  loading = true;
  transactionsLoading = false;
  displayedColumns: string[] = ['date', 'description', 'reference', 'type', 'amount', 'balance'];
  
  transactionTypes = [
    { value: 'ALL', label: 'All Types' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'TRANSFER_IN', label: 'Transfer In' },
    { value: 'TRANSFER_OUT', label: 'Transfer Out' },
    { value: 'BILL_PAYMENT', label: 'Bill Payment' },
    { value: 'CHEQUE_DEPOSIT', label: 'Cheque Deposit' },
    { value: 'INTEREST_CREDIT', label: 'Interest Credit' },
    { value: 'CHARGES', label: 'Charges' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Initialize the date range form
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    this.filterForm = this.formBuilder.group({
      startDate: [monthAgo],
      endDate: [today],
      transactionType: ['ALL']
    });
    
    this.route.paramMap.subscribe(params => {
      this.accountId = +params.get('id');
      this.loadAccountDetails();
      this.applyFilter();
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

  applyFilter(): void {
    if (!this.filterForm.valid) {
      return;
    }
    
    const filterValues = this.filterForm.value;
    
    this.transactionsLoading = true;
    this.transactionService.getDetailedStatement(
      this.accountId,
      filterValues.startDate,
      filterValues.endDate,
      filterValues.transactionType
    ).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.transactionsLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load transactions', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.transactionsLoading = false;
      }
    });
  }

  resetFilter(): void {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    this.filterForm.reset({
      startDate: monthAgo,
      endDate: today,
      transactionType: 'ALL'
    });
    
    this.applyFilter();
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

  getTransactionTypeLabel(type: string): string {
    const found = this.transactionTypes.find(t => t.value === type);
    return found ? found.label : type;
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
