import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Account } from '../../../core/models/account.model';
import { TransactionType, TransactionStatus } from '../../../core/models/transaction.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-money-transfer',
  templateUrl: './money-transfer.component.html',
  styleUrls: ['./money-transfer.component.scss']
})
export class MoneyTransferComponent implements OnInit {
  transferForm: FormGroup;
  accounts: Account[] = [];
  recentTransfers: any[] = [];
  isLoading = true;
  isSubmitting = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.transferForm = this.formBuilder.group({
      fromAccountId: ['', Validators.required],
      toAccountNumber: ['', [Validators.required, Validators.pattern(/^\d{10,16}$/)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.maxLength(100)]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadRecentTransfers();
  }
  
  loadAccounts(): void {
    this.isLoading = true;
    
    this.accountService.getAccounts().subscribe({
      next: accounts => {
        // Filter out Fixed Deposit accounts since they don't allow transfers
        this.accounts = accounts.filter(account => account.accountType !== 'FIXED_DEPOSIT');
        this.isLoading = false;
        
        if (this.accounts.length > 0) {
          this.transferForm.patchValue({ fromAccountId: this.accounts[0].id });
        }
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open(`Error loading accounts: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  loadRecentTransfers(): void {
    // Get recent transfer transactions
    this.http.get<any[]>(`${environment.apiUrl}/transfers/recent`).subscribe({
      next: transfers => {
        this.recentTransfers = transfers;
      },
      error: error => {
        this.snackBar.open(`Error loading recent transfers: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  onSubmit(): void {
    if (this.transferForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    const transfer = {
      fromAccountId: this.transferForm.value.fromAccountId,
      toAccountNumber: this.transferForm.value.toAccountNumber,
      amount: this.transferForm.value.amount,
      description: this.transferForm.value.description || 'Fund Transfer'
    };
    
    this.http.post(`${environment.apiUrl}/transfers`, transfer).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.snackBar.open('Transfer completed successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        // Reset form
        this.transferForm.patchValue({
          toAccountNumber: '',
          amount: '',
          description: ''
        });
        
        // Reload accounts to get updated balances
        this.loadAccounts();
        // Reload recent transfers
        this.loadRecentTransfers();
      },
      error: error => {
        this.isSubmitting = false;
        this.snackBar.open(`Transfer failed: ${error.message}`, 'Close', {
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
  
  getAccountLabel(account: Account): string {
    return `${account.accountNumber} (${account.accountType === 'SAVINGS' ? 'Savings' : 'Current'}) - ${this.formatCurrency(account.balance)}`;
  }
}
