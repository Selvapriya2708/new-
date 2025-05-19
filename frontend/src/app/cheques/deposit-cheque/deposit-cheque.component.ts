import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../core/services/account.service';
import { ChequeService } from '../../core/services/cheque.service';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-deposit-cheque',
  templateUrl: './deposit-cheque.component.html',
  styleUrls: ['./deposit-cheque.component.scss']
})
export class DepositChequeComponent implements OnInit {
  depositForm: FormGroup;
  accounts: Account[] = [];
  loading = false;
  submitting = false;
  success = false;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private chequeService: ChequeService,
    private snackBar: MatSnackBar
  ) {
    this.depositForm = this.fb.group({
      accountId: ['', Validators.required],
      chequeNumber: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      payeeName: ['', Validators.required],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    
    // Check for pre-selected account from query params
    this.route.queryParams.subscribe(params => {
      if (params['accountId']) {
        this.depositForm.patchValue({ accountId: params['accountId'] });
      }
    });
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        // Filter out fixed deposit accounts
        this.accounts = accounts.filter(account => account.accountType !== 'FIXED_DEPOSIT');
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(`Error loading accounts: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onSubmit(): void {
    if (this.depositForm.invalid) {
      return;
    }
    
    this.submitting = true;
    const formValues = this.depositForm.value;
    
    this.chequeService.depositCheque(formValues).subscribe({
      next: (response) => {
        this.submitting = false;
        this.success = true;
        this.snackBar.open('Cheque deposit request submitted successfully. Please send the physical cheque to the bank.', 'Close', {
          duration: 8000,
          panelClass: ['success-snackbar']
        });
        
        // Reset form
        this.depositForm.reset();
        this.depositForm.patchValue({ accountId: formValues.accountId });
      },
      error: (error) => {
        this.submitting = false;
        this.snackBar.open(`Error submitting cheque deposit: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  printBankSlip(): void {
    // This would ideally print a bank slip, but for now we'll show a message
    this.snackBar.open('Printing functionality will be available soon.', 'Close', {
      duration: 3000
    });
  }

  getAccountTypeName(type: string): string {
    switch (type) {
      case 'SAVINGS': return 'Savings Account';
      case 'CURRENT': return 'Current Account';
      case 'FIXED_DEPOSIT': return 'Fixed Deposit';
      default: return type;
    }
  }

  getAccountDisplay(account: Account): string {
    return `${this.getAccountTypeName(account.accountType)} - ${account.accountNumber}`;
  }
}
