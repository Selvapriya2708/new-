import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { ChequeService } from '../../../core/services/cheque.service';
import { Account } from '../../../core/models/account.model';
import { ChequeDepositRequest } from '../../../core/models/cheque.model';

@Component({
  selector: 'app-cheque-deposit',
  templateUrl: './cheque-deposit.component.html',
  styleUrls: ['./cheque-deposit.component.scss']
})
export class ChequeDepositComponent implements OnInit {
  chequeForm: FormGroup;
  accounts: Account[] = [];
  isLoading = false;
  isSubmitting = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private chequeService: ChequeService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.chequeForm = this.formBuilder.group({
      accountId: ['', Validators.required],
      chequeNumber: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      payeeName: ['', Validators.required],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }
  
  loadAccounts(): void {
    this.isLoading = true;
    
    this.accountService.getAccounts().subscribe({
      next: accounts => {
        // Filter out Fixed Deposit accounts since they don't allow deposits
        this.accounts = accounts.filter(account => account.accountType !== 'FIXED_DEPOSIT');
        this.isLoading = false;
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
  
  onSubmit(): void {
    if (this.chequeForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    const request: ChequeDepositRequest = {
      accountId: this.chequeForm.value.accountId,
      chequeNumber: this.chequeForm.value.chequeNumber,
      amount: this.chequeForm.value.amount,
      payeeName: this.chequeForm.value.payeeName,
      bankName: this.chequeForm.value.bankName,
      branchName: this.chequeForm.value.branchName
    };
    
    this.chequeService.depositCheque(request).subscribe({
      next: cheque => {
        this.isSubmitting = false;
        this.snackBar.open('Cheque deposit request submitted successfully!', 'Print Slip', {
          duration: 10000,
          panelClass: ['success-snackbar']
        }).onAction().subscribe(() => {
          this.printChequeSlip(cheque.id);
        });
        
        // Reset form
        this.chequeForm.reset({
          accountId: '',
          chequeNumber: '',
          amount: '',
          payeeName: '',
          bankName: '',
          branchName: ''
        });
      },
      error: error => {
        this.isSubmitting = false;
        this.snackBar.open(`Failed to submit cheque deposit: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  printChequeSlip(chequeId: number): void {
    this.chequeService.printChequeSlip(chequeId).subscribe({
      next: blob => {
        // Create a blob URL and open it in a new window
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up the URL object after some time
        setTimeout(() => window.URL.revokeObjectURL(url), 30000);
      },
      error: error => {
        this.snackBar.open(`Error printing cheque slip: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  navigateToChequeStatus(): void {
    this.router.navigate(['/cheques/status']);
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
