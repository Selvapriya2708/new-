import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../core/services/account.service';
import { BillPaymentService } from '../../core/services/bill-payment.service';
import { Account } from '../../core/models/account.model';
import { Biller, BillerCategory } from '../../core/models/bill-payment.model';

@Component({
  selector: 'app-bill-payment',
  templateUrl: './bill-payment.component.html',
  styleUrls: ['./bill-payment.component.scss']
})
export class BillPaymentComponent implements OnInit {
  billPaymentForm: FormGroup;
  accounts: Account[] = [];
  billers: Biller[] = [];
  filteredBillers: Biller[] = [];
  billerCategories = Object.values(BillerCategory);
  selectedCategory: BillerCategory | null = null;
  
  loading = false;
  accountsLoading = true;
  billersLoading = true;
  submitting = false;
  success = false;
  
  // For scheduling
  isScheduled = false;
  minDate = new Date();
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private billPaymentService: BillPaymentService,
    private snackBar: MatSnackBar
  ) {
    this.billPaymentForm = this.fb.group({
      accountId: ['', Validators.required],
      billerId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      reference: ['', Validators.required],
      description: [''],
      scheduledDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadBillers();
    
    // Check for pre-selected account from query params
    this.route.queryParams.subscribe(params => {
      if (params['accountId']) {
        this.billPaymentForm.patchValue({ accountId: params['accountId'] });
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

  loadBillers(): void {
    this.billersLoading = true;
    this.billPaymentService.getBillers().subscribe({
      next: (billers) => {
        this.billers = billers;
        this.filteredBillers = billers;
        this.billersLoading = false;
      },
      error: (error) => {
        this.billersLoading = false;
        this.snackBar.open(`Error loading billers: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  filterBillers(): void {
    if (this.selectedCategory) {
      this.filteredBillers = this.billers.filter(
        biller => biller.category === this.selectedCategory
      );
    } else {
      this.filteredBillers = [...this.billers];
    }
  }

  toggleScheduling(): void {
    this.isScheduled = !this.isScheduled;
    
    if (this.isScheduled) {
      // Set default scheduled date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.billPaymentForm.get('scheduledDate')?.setValue(tomorrow);
    } else {
      this.billPaymentForm.get('scheduledDate')?.setValue(null);
    }
  }

  onSubmit(): void {
    if (this.billPaymentForm.invalid) {
      return;
    }
    
    this.submitting = true;
    const formValues = this.billPaymentForm.value;
    
    this.billPaymentService.payBill(formValues).subscribe({
      next: (response) => {
        this.submitting = false;
        this.success = true;
        
        const message = this.isScheduled ? 
          'Bill payment scheduled successfully.' : 
          'Bill payment processed successfully.';
        
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        // Reset form
        this.resetForm();
      },
      error: (error) => {
        this.submitting = false;
        this.snackBar.open(`Error processing bill payment: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  resetForm(): void {
    this.billPaymentForm.reset();
    this.isScheduled = false;
    
    // If we had a pre-selected account, keep it
    const accountId = this.route.snapshot.queryParams['accountId'];
    if (accountId) {
      this.billPaymentForm.patchValue({ accountId });
    }
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

  getBillerCategoryName(category: string): string {
    return category.replace('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }
}
