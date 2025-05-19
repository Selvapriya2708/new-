import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-money-transfer',
  templateUrl: './money-transfer.component.html',
  styleUrls: ['./money-transfer.component.scss']
})
export class MoneyTransferComponent implements OnInit {
  transferForm: FormGroup;
  accounts: Account[] = [];
  sourceAccount: Account | null = null;
  loading = false;
  accountsLoading = true;
  submitting = false;
  success = false;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {
    this.transferForm = this.fb.group({
      fromAccountId: ['', Validators.required],
      toAccountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['']
    }, { validator: this.differentAccountsValidator });
  }

  ngOnInit(): void {
    this.loadAccounts();
    
    // Check for pre-selected account from query params
    this.route.queryParams.subscribe(params => {
      if (params['fromAccount']) {
        this.transferForm.patchValue({ fromAccountId: params['fromAccount'] });
        this.updateSourceAccount();
      }
    });
  }

  loadAccounts(): void {
    this.accountsLoading = true;
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        // Filter out fixed deposit accounts and inactive accounts
        this.accounts = accounts.filter(account => 
          account.accountType !== 'FIXED_DEPOSIT' && 
          account.status === 'ACTIVE'
        );
        this.accountsLoading = false;
        
        // If fromAccountId is already selected, update the source account
        this.updateSourceAccount();
      },
      error: (error) => {
        this.accountsLoading = false;
        this.snackBar.open(`Error loading accounts: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  updateSourceAccount(): void {
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;
    if (fromAccountId) {
      this.sourceAccount = this.accounts.find(account => account.id.toString() === fromAccountId.toString()) || null;
    } else {
      this.sourceAccount = null;
    }
  }

  // Custom validator to ensure fromAccount and toAccount are different
  differentAccountsValidator(group: FormGroup): {[key: string]: any} | null {
    const fromAccountId = group.get('fromAccountId')?.value;
    const toAccountId = group.get('toAccountId')?.value;
    
    return fromAccountId && toAccountId && fromAccountId === toAccountId
      ? { sameAccounts: true }
      : null;
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      return;
    }
    
    this.submitting = true;
    const formValues = this.transferForm.value;
    
    this.transactionService.transferFunds(formValues).subscribe({
      next: (response) => {
        this.submitting = false;
        this.success = true;
        this.snackBar.open('Money transfer completed successfully.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        // Reset form but keep from account
        const fromAccountId = formValues.fromAccountId;
        this.transferForm.reset();
        this.transferForm.patchValue({ fromAccountId });
      },
      error: (error) => {
        this.submitting = false;
        this.snackBar.open(`Error processing transfer: ${error.message}`, 'Close', {
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
      default: return type;
    }
  }

  getAccountDisplay(account: Account): string {
    return `${this.getAccountTypeName(account.accountType)} - ${account.accountNumber} (${this.formatCurrency(account.balance)})`;
  }
}
