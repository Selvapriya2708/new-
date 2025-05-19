import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../../core/services/account.service';
import { BillService } from '../../../core/services/bill.service';
import { Account } from '../../../core/models/account.model';
import { BillType, BillStatus, Bill, BillPaymentRequest } from '../../../core/models/bill.model';

@Component({
  selector: 'app-bill-payment',
  templateUrl: './bill-payment.component.html',
  styleUrls: ['./bill-payment.component.scss']
})
export class BillPaymentComponent implements OnInit {
  billForm: FormGroup;
  accounts: Account[] = [];
  billProviders: { [key: string]: string[] } = {};
  scheduledBills: Bill[] = [];
  paidBills: Bill[] = [];
  
  isLoading = true;
  isSubmitting = false;
  isLoadingProviders = true;
  isLoadingHistory = true;
  
  // For display purposes
  billTypes = Object.values(BillType);
  
  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private billService: BillService,
    private snackBar: MatSnackBar
  ) {
    this.billForm = this.formBuilder.group({
      accountId: ['', Validators.required],
      billType: ['', Validators.required],
      provider: ['', Validators.required],
      billNumber: ['', [Validators.required, Validators.minLength(5)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      payNow: [true],
      scheduledDate: [{ value: null, disabled: true }]
    });
    
    // Watch for payNow changes to enable/disable scheduledDate
    this.billForm.get('payNow')?.valueChanges.subscribe(payNow => {
      const scheduledDateControl = this.billForm.get('scheduledDate');
      
      if (payNow) {
        scheduledDateControl?.disable();
        scheduledDateControl?.setValue(null);
      } else {
        scheduledDateControl?.enable();
        
        // Set default scheduled date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        scheduledDateControl?.setValue(tomorrow);
      }
    });
    
    // Watch for billType changes to update provider options
    this.billForm.get('billType')?.valueChanges.subscribe(billType => {
      this.billForm.get('provider')?.setValue('');
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadBillProviders();
    this.loadScheduledBills();
    this.loadPaidBills();
  }
  
  loadAccounts(): void {
    this.isLoading = true;
    
    this.accountService.getAccounts().subscribe({
      next: accounts => {
        // Filter out Fixed Deposit accounts
        this.accounts = accounts.filter(account => account.accountType !== 'FIXED_DEPOSIT');
        this.isLoading = false;
        
        if (this.accounts.length > 0) {
          this.billForm.patchValue({ accountId: this.accounts[0].id });
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
  
  loadBillProviders(): void {
    this.isLoadingProviders = true;
    
    this.billService.getSupportedBillProviders().subscribe({
      next: providers => {
        this.billProviders = providers;
        this.isLoadingProviders = false;
      },
      error: error => {
        this.isLoadingProviders = false;
        this.snackBar.open(`Error loading bill providers: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  loadScheduledBills(): void {
    this.isLoadingHistory = true;
    
    this.billService.getScheduledBills().subscribe({
      next: bills => {
        this.scheduledBills = bills;
        this.isLoadingHistory = false;
      },
      error: error => {
        this.isLoadingHistory = false;
        this.snackBar.open(`Error loading scheduled bills: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  loadPaidBills(): void {
    // For simplicity, we'll just get bills for the first account
    if (this.accounts.length > 0) {
      this.billService.getBillsByAccount(this.accounts[0].id).subscribe({
        next: bills => {
          this.paidBills = bills.filter(bill => bill.status === BillStatus.PAID);
        }
      });
    }
  }
  
  onSubmit(): void {
    if (this.billForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    const request: BillPaymentRequest = {
      accountId: this.billForm.value.accountId,
      billType: this.billForm.value.billType,
      billNumber: this.billForm.value.billNumber,
      amount: this.billForm.value.amount,
      provider: this.billForm.value.provider,
      description: this.billForm.value.description,
      payNow: this.billForm.value.payNow,
      scheduledDate: this.billForm.value.payNow ? undefined : this.billForm.value.scheduledDate
    };
    
    this.billService.payBill(request).subscribe({
      next: bill => {
        this.isSubmitting = false;
        
        // Show success message
        if (bill.status === BillStatus.PAID) {
          this.snackBar.open('Bill payment successful!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          // Add to paid bills
          this.paidBills.unshift(bill);
        } else {
          this.snackBar.open('Bill payment has been scheduled successfully!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          // Add to scheduled bills
          this.scheduledBills.unshift(bill);
        }
        
        // Reset form
        this.resetForm();
      },
      error: error => {
        this.isSubmitting = false;
        this.snackBar.open(`Failed to process bill payment: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  cancelScheduledBill(billId: number): void {
    this.billService.cancelScheduledBill(billId).subscribe({
      next: () => {
        this.snackBar.open('Scheduled bill payment has been cancelled', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        // Remove from scheduled bills
        this.scheduledBills = this.scheduledBills.filter(bill => bill.id !== billId);
      },
      error: error => {
        this.snackBar.open(`Failed to cancel scheduled payment: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  resetForm(): void {
    this.billForm.reset({
      accountId: this.accounts.length > 0 ? this.accounts[0].id : '',
      billType: '',
      provider: '',
      billNumber: '',
      amount: '',
      description: '',
      payNow: true,
      scheduledDate: null
    });
  }
  
  getProvidersForBillType(billType: string): string[] {
    return this.billProviders[billType] || [];
  }
  
  getBillTypeLabel(type: string): string {
    return type.replace('_', ' ');
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
