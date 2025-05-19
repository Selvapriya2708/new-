import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { BillPaymentService } from '../../../core/services/bill-payment.service';
import { Account } from '../../../core/models/account.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-bill-payment-form',
  templateUrl: './bill-payment-form.component.html',
  styleUrls: ['./bill-payment-form.component.scss']
})
export class BillPaymentFormComponent implements OnInit {
  accounts: Account[] = [];
  utilityProviders: any[] = [];
  billPaymentForm!: FormGroup;
  loading = true;
  submitting = false;
  error = '';
  success = '';
  scheduleMode = false;
  selectedAccountId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private billPaymentService: BillPaymentService
  ) { }

  ngOnInit(): void {
    this.initBillPaymentForm();
    this.loadAccounts();
    this.loadUtilityProviders();
    
    // Check if account ID was passed from another component
    this.route.queryParams.subscribe(params => {
      if (params['accountId']) {
        this.selectedAccountId = +params['accountId'];
        this.billPaymentForm.patchValue({
          accountId: this.selectedAccountId
        });
      }
    });
  }

  initBillPaymentForm(): void {
    const today = new Date();
    
    this.billPaymentForm = this.formBuilder.group({
      accountId: ['', Validators.required],
      billType: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      referenceNumber: ['', Validators.required],
      payeeName: ['', Validators.required],
      description: [''],
      schedulePayment: [false],
      scheduleDate: [this.formatDate(new Date(today.setDate(today.getDate() + 1)))]
    });

    // Listen for changes to schedulePayment
    this.billPaymentForm.get('schedulePayment')?.valueChanges.subscribe(value => {
      this.scheduleMode = value;
      
      if (value) {
        this.billPaymentForm.get('scheduleDate')?.setValidators([Validators.required]);
      } else {
        this.billPaymentForm.get('scheduleDate')?.clearValidators();
      }
      
      this.billPaymentForm.get('scheduleDate')?.updateValueAndValidity();
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = '';

    this.accountService.getAllAccounts()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (accounts) => {
          // Filter out fixed deposits as they can't be used for bill payments
          this.accounts = accounts.filter(account => 
            account.accountType !== 'FIXED_DEPOSIT' && account.status === 'ACTIVE'
          );
          
          // If we have a selected account ID, ensure it's in the filtered accounts
          if (this.selectedAccountId) {
            const accountExists = this.accounts.some(account => account.id === this.selectedAccountId);
            if (!accountExists) {
              this.selectedAccountId = null;
              this.billPaymentForm.get('accountId')?.setValue('');
            }
          }
        },
        error: (err) => {
          this.error = 'Failed to load accounts. Please try again later.';
          console.error('Error loading accounts:', err);
        }
      });
  }

  loadUtilityProviders(): void {
    this.billPaymentService.getUtilityProviders()
      .subscribe({
        next: (providers) => {
          this.utilityProviders = providers;
        },
        error: (err) => {
          console.error('Error loading utility providers:', err);
          // Use default providers if API fails
          this.utilityProviders = [
            { id: 'ELECTRICITY', name: 'Electricity' },
            { id: 'WATER', name: 'Water' },
            { id: 'TELEPHONE', name: 'Telephone' },
            { id: 'MOBILE', name: 'Mobile Phone' },
            { id: 'INTERNET', name: 'Internet' },
            { id: 'CREDIT_CARD', name: 'Credit Card' },
            { id: 'INSURANCE', name: 'Insurance' },
            { id: 'OTHER', name: 'Other' }
          ];
        }
      });
  }

  onSubmit(): void {
    if (this.billPaymentForm.invalid) {
      // Mark all fields as touched to display validation errors
      Object.keys(this.billPaymentForm.controls).forEach(key => {
        this.billPaymentForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.submitting = true;
    this.error = '';
    this.success = '';
    
    const billPaymentData = {
      accountId: this.billPaymentForm.get('accountId')?.value,
      billType: this.billPaymentForm.get('billType')?.value,
      amount: this.billPaymentForm.get('amount')?.value,
      payeeDetails: {
        referenceNumber: this.billPaymentForm.get('referenceNumber')?.value,
        payeeName: this.billPaymentForm.get('payeeName')?.value
      },
      description: this.billPaymentForm.get('description')?.value || `Payment for ${this.billPaymentForm.get('billType')?.value}`,
      scheduleDate: this.scheduleMode ? this.billPaymentForm.get('scheduleDate')?.value : null
    };
    
    if (this.scheduleMode) {
      this.billPaymentService.scheduleBillPayment(billPaymentData)
        .pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: () => {
            this.success = 'Bill payment has been scheduled successfully!';
            this.resetForm();
          },
          error: (err) => {
            this.error = err.message || 'Failed to schedule bill payment. Please try again.';
            console.error('Error scheduling bill payment:', err);
          }
        });
    } else {
      this.billPaymentService.payBill(billPaymentData)
        .pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: () => {
            this.success = 'Bill payment processed successfully!';
            this.resetForm();
          },
          error: (err) => {
            this.error = err.message || 'Failed to process bill payment. Please try again.';
            console.error('Error processing bill payment:', err);
          }
        });
    }
  }

  resetForm(): void {
    const keepAccountId = this.billPaymentForm.get('accountId')?.value;
    this.billPaymentForm.reset({
      accountId: keepAccountId,
      schedulePayment: false,
      scheduleDate: this.formatDate(new Date(new Date().setDate(new Date().getDate() + 1)))
    });
  }

  viewScheduledPayments(): void {
    this.router.navigate(['/accounts']);
  }

  getAccountTypeLabel(type: string): string {
    switch (type) {
      case 'SAVINGS': return 'Savings Account';
      case 'CURRENT': return 'Current Account';
      default: return type;
    }
  }

  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDate(tomorrow);
  }
}
