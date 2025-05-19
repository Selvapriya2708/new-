import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../shared/services/account.service';
import { TransactionService } from '../../shared/services/transaction.service';
import { Account } from '../../shared/models/account.model';
import { Cheque, ChequeStatus } from '../../shared/models/cheque.model';

@Component({
  selector: 'app-cheque-deposit',
  templateUrl: './cheque-deposit.component.html',
  styleUrls: ['./cheque-deposit.component.scss']
})
export class ChequeDepositComponent implements OnInit {
  chequeForm: FormGroup;
  accounts: Account[] = [];
  cheques: Cheque[] = [];
  loading = true;
  chequeHistoryLoading = true;
  submitting = false;
  destinationAccountId: number;
  chequeStatuses = Object.values(ChequeStatus);

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Initialize form
    this.chequeForm = this.formBuilder.group({
      chequeNumber: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      amount: ['', [Validators.required, Validators.min(1)]],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      chequeDate: [new Date(), Validators.required],
      accountId: ['', Validators.required]
    });

    // Pre-fill destination account if provided in query params
    this.route.queryParams.subscribe(params => {
      if (params.destinationAccountId) {
        this.destinationAccountId = +params.destinationAccountId;
        this.chequeForm.patchValue({ accountId: this.destinationAccountId });
      }
    });

    this.loadAccounts();
    this.loadChequeHistory();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        // Filter out Fixed Deposits as they cannot receive cheque deposits
        this.accounts = accounts.filter(account => account.type !== 'FIXED_DEPOSIT');
        
        if (this.accounts.length > 0 && !this.destinationAccountId) {
          this.chequeForm.patchValue({ accountId: this.accounts[0].id });
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

  loadChequeHistory(): void {
    this.chequeHistoryLoading = true;
    this.transactionService.getChequeHistory().subscribe({
      next: (cheques) => {
        this.cheques = cheques;
        this.chequeHistoryLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load cheque history', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.chequeHistoryLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.chequeForm.invalid) {
      return;
    }

    this.submitting = true;
    const chequeData = { ...this.chequeForm.value };

    this.transactionService.depositCheque(chequeData).subscribe({
      next: (response) => {
        this.snackBar.open('Cheque deposited successfully. Please print the slip and send it along with the cheque to the bank.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        this.submitting = false;
        this.loadChequeHistory();
        this.resetForm();
      },
      error: (error) => {
        let errorMessage = 'Failed to deposit cheque';
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
    this.chequeForm.reset({
      chequeNumber: '',
      amount: '',
      bankName: '',
      branchName: '',
      chequeDate: new Date(),
      accountId: this.destinationAccountId || (this.accounts.length > 0 ? this.accounts[0].id : '')
    });
  }

  printChequeSlip(cheque: Cheque): void {
    // In a real application, this would open a print-friendly view
    this.snackBar.open('Printing cheque slip...', 'Close', {
      duration: 2000
    });
    
    // For now, we'll just log it
    console.log('Printing cheque slip for:', cheque);
  }

  getAccountById(accountId: number): Account | undefined {
    return this.accounts.find(account => account.id === accountId);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'NOT_RECEIVED':
        return 'status-not-received';
      case 'RECEIVED':
        return 'status-received';
      case 'SENT_FOR_CLEARANCE':
        return 'status-clearing';
      case 'CLEARED':
        return 'status-cleared';
      case 'BOUNCED':
        return 'status-bounced';
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
}
