import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../shared/services/account.service';
import { TransactionService } from '../../shared/services/transaction.service';
import { Account } from '../../shared/models/account.model';
import { Transaction } from '../../shared/models/transaction.model';

@Component({
  selector: 'app-money-transfer',
  templateUrl: './money-transfer.component.html',
  styleUrls: ['./money-transfer.component.scss']
})
export class MoneyTransferComponent implements OnInit {
  transferForm: FormGroup;
  accounts: Account[] = [];
  recentTransfers: Transaction[] = [];
  loading = true;
  transferHistoryLoading = true;
  submitting = false;
  sourceAccountId: number;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Initialize form
    this.transferForm = this.formBuilder.group({
      sourceAccountId: ['', Validators.required],
      destinationAccountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,16}$')]],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.maxLength(100)]]
    });

    // Pre-fill source account if provided in query params
    this.route.queryParams.subscribe(params => {
      if (params.sourceAccountId) {
        this.sourceAccountId = +params.sourceAccountId;
        this.transferForm.patchValue({ sourceAccountId: this.sourceAccountId });
      }
    });

    this.loadAccounts();
    this.loadTransferHistory();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        // Filter out Fixed Deposits as they cannot be used for transfers
        this.accounts = accounts.filter(account => account.type !== 'FIXED_DEPOSIT');
        
        if (this.accounts.length > 0 && !this.sourceAccountId) {
          this.transferForm.patchValue({ sourceAccountId: this.accounts[0].id });
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load accounts', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  loadTransferHistory(): void {
    this.transferHistoryLoading = true;
    this.transactionService.getTransferHistory().subscribe({
      next: (transfers) => {
        this.recentTransfers = transfers;
        this.transferHistoryLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load transfer history', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.transferHistoryLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      return;
    }

    this.submitting = true;
    const transferData = { ...this.transferForm.value };

    this.transactionService.transferMoney(transferData).subscribe({
      next: (response) => {
        this.snackBar.open('Money transferred successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        this.submitting = false;
        this.loadTransferHistory();
        this.resetForm();
      },
      error: (error) => {
        let errorMessage = 'Failed to transfer money';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        
        this.submitting = false;
      }
    });
  }

  resetForm(): void {
    this.transferForm.reset({
      sourceAccountId: this.sourceAccountId || (this.accounts.length > 0 ? this.accounts[0].id : ''),
      destinationAccountNumber: '',
      amount: '',
      description: ''
    });
  }

  repeatTransfer(transfer: Transaction): void {
    const sourceAccount = this.accounts.find(account => account.accountNumber === transfer.sourceAccountNumber);
    
    if (sourceAccount) {
      this.transferForm.patchValue({
        sourceAccountId: sourceAccount.id,
        destinationAccountNumber: transfer.destinationAccountNumber,
        amount: transfer.amount,
        description: transfer.description
      });
    } else {
      this.snackBar.open('Source account not found', 'Close', {
        duration: 3000
      });
    }
  }

  getAccountById(accountId: number): Account | undefined {
    return this.accounts.find(account => account.id === accountId);
  }

  getAccountByNumber(accountNumber: string): Account | undefined {
    return this.accounts.find(account => account.accountNumber === accountNumber);
  }

  getFormattedAmount(amount: number): string {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  }
}
