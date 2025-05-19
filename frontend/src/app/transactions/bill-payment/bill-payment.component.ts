import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../shared/services/account.service';
import { TransactionService } from '../../shared/services/transaction.service';
import { Account } from '../../shared/models/account.model';

interface BillProvider {
  id: string;
  name: string;
  type: string;
  logo: string;
}

interface BillPayment {
  id: number;
  accountId: number;
  providerId: string;
  providerName: string;
  billNumber: string;
  amount: number;
  status: string;
  date: Date;
  scheduledDate?: Date;
}

@Component({
  selector: 'app-bill-payment',
  templateUrl: './bill-payment.component.html',
  styleUrls: ['./bill-payment.component.scss']
})
export class BillPaymentComponent implements OnInit {
  billPaymentForm: FormGroup;
  accounts: Account[] = [];
  billPayments: BillPayment[] = [];
  loading = true;
  billHistoryLoading = true;
  submitting = false;
  payNow = true;
  sourceAccountId: number;
  minDate = new Date();

  billProviders: BillProvider[] = [
    { id: 'ELECTRICITY_1', name: 'City Power Corporation', type: 'ELECTRICITY', logo: 'power' },
    { id: 'ELECTRICITY_2', name: 'State Electricity Board', type: 'ELECTRICITY', logo: 'power' },
    { id: 'TELEPHONE_1', name: 'Telecom Services Ltd', type: 'TELEPHONE', logo: 'phone' },
    { id: 'TELEPHONE_2', name: 'Global Communications', type: 'TELEPHONE', logo: 'phone' },
    { id: 'WATER_1', name: 'Municipal Water Supply', type: 'WATER', logo: 'water_drop' },
    { id: 'INTERNET_1', name: 'Fiber Broadband', type: 'INTERNET', logo: 'wifi' },
    { id: 'INTERNET_2', name: 'High-Speed Internet', type: 'INTERNET', logo: 'wifi' },
    { id: 'MOBILE_1', name: 'Mobile Network Provider', type: 'MOBILE', logo: 'smartphone' },
    { id: 'MOBILE_2', name: 'Cellular Services Inc', type: 'MOBILE', logo: 'smartphone' }
  ];

  providerTypes = [
    { value: 'ALL', label: 'All Types' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'TELEPHONE', label: 'Telephone' },
    { value: 'WATER', label: 'Water' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'MOBILE', label: 'Mobile' }
  ];

  filteredProviders: BillProvider[] = this.billProviders;
  selectedProviderType = 'ALL';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Initialize form
    this.billPaymentForm = this.formBuilder.group({
      providerId: ['', Validators.required],
      billNumber: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      accountId: ['', Validators.required],
      scheduledDate: [{ value: this.getNextDay(), disabled: true }],
      paymentType: ['now'] // 'now' or 'scheduled'
    });

    // Watch for paymentType changes to enable/disable scheduledDate
    this.billPaymentForm.get('paymentType').valueChanges.subscribe(value => {
      this.payNow = value === 'now';
      if (this.payNow) {
        this.billPaymentForm.get('scheduledDate').disable();
      } else {
        this.billPaymentForm.get('scheduledDate').enable();
      }
    });

    // Pre-fill source account if provided in query params
    this.route.queryParams.subscribe(params => {
      if (params.sourceAccountId) {
        this.sourceAccountId = +params.sourceAccountId;
        this.billPaymentForm.patchValue({ accountId: this.sourceAccountId });
      }
    });

    this.loadAccounts();
    this.loadBillPaymentHistory();
  }

  getNextDay(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        // Filter out Fixed Deposits as they cannot be used for bill payments
        this.accounts = accounts.filter(account => account.type !== 'FIXED_DEPOSIT');
        
        if (this.accounts.length > 0 && !this.sourceAccountId) {
          this.billPaymentForm.patchValue({ accountId: this.accounts[0].id });
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

  loadBillPaymentHistory(): void {
    this.billHistoryLoading = true;
    this.transactionService.getBillPaymentHistory().subscribe({
      next: (bills) => {
        this.billPayments = bills;
        this.billHistoryLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load bill payment history', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.billHistoryLoading = false;
      }
    });
  }

  filterProviders(type: string): void {
    this.selectedProviderType = type;
    
    if (type === 'ALL') {
      this.filteredProviders = [...this.billProviders];
    } else {
      this.filteredProviders = this.billProviders.filter(provider => provider.type === type);
    }
    
    // Reset the selected provider if it doesn't match the filter
    const currentProviderId = this.billPaymentForm.get('providerId').value;
    if (currentProviderId) {
      const provider = this.billProviders.find(p => p.id === currentProviderId);
      if (provider && (type !== 'ALL' && provider.type !== type)) {
        this.billPaymentForm.patchValue({ providerId: '' });
      }
    }
  }

  onSubmit(): void {
    if (this.billPaymentForm.invalid) {
      return;
    }

    this.submitting = true;
    const billData = { ...this.billPaymentForm.value };
    
    // Set the provider name based on the selected provider ID
    const provider = this.billProviders.find(p => p.id === billData.providerId);
    billData.providerName = provider ? provider.name : '';
    
    // If it's immediate payment, remove the scheduled date
    if (billData.paymentType === 'now') {
      billData.scheduledDate = null;
    }

    this.transactionService.payBill(billData).subscribe({
      next: (response) => {
        let message = 'Bill payment successful!';
        if (billData.paymentType === 'scheduled') {
          message = 'Bill payment scheduled successfully!';
        }
        
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        this.submitting = false;
        this.loadBillPaymentHistory();
        this.resetForm();
      },
      error: (error) => {
        let errorMessage = 'Failed to process bill payment';
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
    this.billPaymentForm.reset({
      providerId: '',
      billNumber: '',
      amount: '',
      accountId: this.sourceAccountId || (this.accounts.length > 0 ? this.accounts[0].id : ''),
      scheduledDate: this.getNextDay(),
      paymentType: 'now'
    });
  }

  cancelScheduledPayment(billPaymentId: number): void {
    this.transactionService.cancelBillPayment(billPaymentId).subscribe({
      next: () => {
        this.snackBar.open('Scheduled payment cancelled successfully', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.loadBillPaymentHistory();
      },
      error: (error) => {
        this.snackBar.open('Failed to cancel payment', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getAccountById(accountId: number): Account | undefined {
    return this.accounts.find(account => account.id === accountId);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'SCHEDULED':
        return 'status-scheduled';
      case 'FAILED':
        return 'status-failed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getFormattedAmount(amount: number): string {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  }

  getProviderById(providerId: string): BillProvider | undefined {
    return this.billProviders.find(provider => provider.id === providerId);
  }
}
