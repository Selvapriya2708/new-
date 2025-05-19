import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Account } from '../../../core/models/account.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-money-transfer-form',
  templateUrl: './money-transfer-form.component.html',
  styleUrls: ['./money-transfer-form.component.scss']
})
export class MoneyTransferFormComponent implements OnInit {
  accounts: Account[] = [];
  transferForm!: FormGroup;
  loading = true;
  submitting = false;
  error = '';
  success = '';
  selectedAccountId: number | null = null;

  // Maximum transfer amount (for validation)
  maxTransferAmount = 0;
  
  // For account balance display
  selectedAccount: Account | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) { }

  ngOnInit(): void {
    this.initTransferForm();
    this.loadAccounts();
    
    // Check if account ID was passed from another component
    this.route.queryParams.subscribe(params => {
      if (params['accountId']) {
        this.selectedAccountId = +params['accountId'];
        this.transferForm.patchValue({
          fromAccountId: this.selectedAccountId
        });
        this.updateSelectedAccount();
      }
    });
  }

  initTransferForm(): void {
    this.transferForm = this.formBuilder.group({
      fromAccountId: ['', Validators.required],
      toAccountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,}$')]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });

    // Listen for fromAccountId changes to update max transfer amount
    this.transferForm.get('fromAccountId')?.valueChanges.subscribe(value => {
      this.selectedAccountId = value ? +value : null;
      this.updateSelectedAccount();
    });
    
    // Listen for amount changes to validate against max transfer amount
    this.transferForm.get('amount')?.valueChanges.subscribe(value => {
      const amountControl = this.transferForm.get('amount');
      if (amountControl && this.maxTransferAmount > 0 && value > this.maxTransferAmount) {
        amountControl.setErrors({ exceedsBalance: true });
      }
    });
  }

  updateSelectedAccount(): void {
    if (this.selectedAccountId) {
      this.selectedAccount = this.accounts.find(acc => acc.id === this.selectedAccountId) || null;
      
      if (this.selectedAccount) {
        // For savings account, ensure transfer doesn't go below minimum balance
        if (this.selectedAccount.accountType === 'SAVINGS' && (this.selectedAccount as any).minimumBalance) {
          this.maxTransferAmount = this.selectedAccount.balance - (this.selectedAccount as any).minimumBalance;
        } 
        // For current account, can use full balance plus overdraft if available
        else if (this.selectedAccount.accountType === 'CURRENT' && (this.selectedAccount as any).overdraftLimit) {
          this.maxTransferAmount = this.selectedAccount.balance + (this.selectedAccount as any).overdraftLimit;
        } 
        // Default case
        else {
          this.maxTransferAmount = this.selectedAccount.balance;
        }
        
        // Ensure max transfer amount is not negative
        this.maxTransferAmount = Math.max(0, this.maxTransferAmount);
      }
    } else {
      this.selectedAccount = null;
      this.maxTransferAmount = 0;
    }
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = '';

    this.accountService.getAllAccounts()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (accounts) => {
          // Filter out fixed deposits as they can't be used for transfers
          this.accounts = accounts.filter(account => 
            account.accountType !== 'FIXED_DEPOSIT' && account.status === 'ACTIVE'
          );
          
          // If we have a selected account ID, ensure it's in the filtered accounts
          if (this.selectedAccountId) {
            const accountExists = this.accounts.some(account => account.id === this.selectedAccountId);
            if (accountExists) {
              this.updateSelectedAccount();
            } else {
              this.selectedAccountId = null;
              this.transferForm.get('fromAccountId')?.setValue('');
            }
          }
        },
        error: (err) => {
          this.error = 'Failed to load accounts. Please try again later.';
          console.error('Error loading accounts:', err);
        }
      });
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      // Mark all fields as touched to display validation errors
      Object.keys(this.transferForm.controls).forEach(key => {
        this.transferForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.submitting = true;
    this.error = '';
    this.success = '';
    
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;
    const toAccountNumber = this.transferForm.get('toAccountNumber')?.value;
    const amount = this.transferForm.get('amount')?.value;
    const description = this.transferForm.get('description')?.value;
    
    this.transactionService.transferMoney(fromAccountId, toAccountNumber, amount, description)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: () => {
          this.success = 'Money transferred successfully!';
          
          // Reset form but keep the selected account
          const keepAccountId = this.transferForm.get('fromAccountId')?.value;
          this.transferForm.reset({
            fromAccountId: keepAccountId
          });
          
          // Refresh account data to get updated balance
          this.loadAccounts();
        },
        error: (err) => {
          this.error = err.message || 'Failed to transfer money. Please try again.';
          console.error('Error transferring money:', err);
        }
      });
  }

  viewTransactions(): void {
    this.router.navigate(['/transactions']);
  }

  resetForm(): void {
    const keepAccountId = this.transferForm.get('fromAccountId')?.value;
    this.transferForm.reset({
      fromAccountId: keepAccountId
    });
  }

  getAccountTypeLabel(type: string): string {
    switch (type) {
      case 'SAVINGS': return 'Savings Account';
      case 'CURRENT': return 'Current Account';
      default: return type;
    }
  }

  calculateRemainingBalance(): number {
    if (!this.selectedAccount) return 0;
    
    const amount = parseFloat(this.transferForm.get('amount')?.value) || 0;
    return this.selectedAccount.balance - amount;
  }
}
