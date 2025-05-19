import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../../core/services/account.service';
import { NewAccountRequest, AccountType } from '../../../core/models/account.model';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {
  accountForm: FormGroup;
  isLoading = false;
  fixedDepositRates: { [key: number]: number } = {};
  
  // Account types
  accountTypes = [
    { value: AccountType.SAVINGS, viewValue: 'Savings Account' },
    { value: AccountType.CURRENT, viewValue: 'Current Account' },
    { value: AccountType.FIXED_DEPOSIT, viewValue: 'Fixed Deposit' }
  ];
  
  // FD terms
  fdTerms = [
    { value: 12, viewValue: '12 months' },
    { value: 24, viewValue: '24 months' },
    { value: 36, viewValue: '36 months' }
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.accountForm = this.formBuilder.group({
      accountType: [AccountType.SAVINGS, Validators.required],
      initialDeposit: [1000, [Validators.required, Validators.min(1000)]],
      term: [{ value: 12, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadFixedDepositRates();
    
    // Subscribe to account type changes to handle form dynamics
    this.accountForm.get('accountType')?.valueChanges.subscribe(accountType => {
      const termControl = this.accountForm.get('term');
      const initialDepositControl = this.accountForm.get('initialDeposit');
      
      if (accountType === AccountType.FIXED_DEPOSIT) {
        termControl?.enable();
        initialDepositControl?.setValidators([Validators.required, Validators.min(5000)]);
      } else {
        termControl?.disable();
        initialDepositControl?.setValidators([Validators.required, Validators.min(1000)]);
      }
      
      initialDepositControl?.updateValueAndValidity();
    });
  }
  
  loadFixedDepositRates(): void {
    this.accountService.getFixedDepositRates().subscribe({
      next: rates => {
        this.fixedDepositRates = rates;
      },
      error: error => {
        this.snackBar.open(`Error loading fixed deposit rates: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  onSubmit(): void {
    if (this.accountForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    const request: NewAccountRequest = {
      accountType: this.accountForm.value.accountType,
      initialDeposit: this.accountForm.value.initialDeposit
    };
    
    // Only include term for Fixed Deposit accounts
    if (this.accountForm.value.accountType === AccountType.FIXED_DEPOSIT) {
      request.term = this.accountForm.value.term;
    }
    
    this.accountService.createAccount(request).subscribe({
      next: account => {
        this.isLoading = false;
        this.snackBar.open('Account created successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        // Navigate to the new account details
        this.router.navigate(['/accounts', account.id]);
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open(`Failed to create account: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  getInterestRateForTerm(term: number): number {
    return this.fixedDepositRates[term] || 0;
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
  
  getMinimumInitialDeposit(): number {
    return this.accountForm.value.accountType === AccountType.FIXED_DEPOSIT ? 5000 : 1000;
  }
  
  calculateMaturityAmount(): string {
    if (this.accountForm.value.accountType !== AccountType.FIXED_DEPOSIT) {
      return '';
    }
    
    const principal = this.accountForm.value.initialDeposit;
    const termMonths = this.accountForm.value.term;
    const rate = this.getInterestRateForTerm(termMonths);
    
    if (!principal || !termMonths || !rate) {
      return '';
    }
    
    // Simple interest calculation for fixed deposit
    const interest = (principal * rate * (termMonths / 12)) / 100;
    const maturityAmount = principal + interest;
    
    return this.formatCurrency(maturityAmount);
  }
}
