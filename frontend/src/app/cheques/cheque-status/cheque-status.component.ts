import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChequeService } from '../../core/services/cheque.service';
import { Cheque, ChequeStatus } from '../../core/models/cheque.model';

@Component({
  selector: 'app-cheque-status',
  templateUrl: './cheque-status.component.html',
  styleUrls: ['./cheque-status.component.scss']
})
export class ChequeStatusComponent implements OnInit {
  cheques: Cheque[] = [];
  filteredCheques: Cheque[] = [];
  loading = true;
  error = false;
  
  displayedColumns: string[] = ['chequeNumber', 'accountNumber', 'amount', 'depositDate', 'status', 'actions'];
  
  // Filter options
  statusFilters = [
    { value: null, label: 'All Statuses' },
    { value: ChequeStatus.NOT_RECEIVED, label: 'Not Received' },
    { value: ChequeStatus.RECEIVED, label: 'Received' },
    { value: ChequeStatus.SENT_FOR_CLEARANCE, label: 'Sent for Clearance' },
    { value: ChequeStatus.CLEARED, label: 'Cleared' },
    { value: ChequeStatus.BOUNCED, label: 'Bounced' }
  ];
  
  selectedStatus: ChequeStatus | null = null;
  searchTerm: string = '';
  
  constructor(
    private chequeService: ChequeService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCheques();
  }

  loadCheques(): void {
    this.loading = true;
    this.error = false;
    
    this.chequeService.getCheques().subscribe({
      next: (cheques) => {
        this.cheques = cheques;
        this.filteredCheques = [...cheques];
        this.loading = false;
      },
      error: (error) => {
        this.error = true;
        this.loading = false;
        this.snackBar.open(`Error loading cheques: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyFilters(): void {
    this.filteredCheques = this.cheques.filter(cheque => {
      let matchesStatus = true;
      let matchesSearch = true;
      
      if (this.selectedStatus) {
        matchesStatus = cheque.status === this.selectedStatus;
      }
      
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        matchesSearch = 
          cheque.chequeNumber.toLowerCase().includes(term) ||
          cheque.accountNumber.toLowerCase().includes(term) ||
          cheque.payeeName.toLowerCase().includes(term) ||
          cheque.bankName.toLowerCase().includes(term);
      }
      
      return matchesStatus && matchesSearch;
    });
  }

  resetFilters(): void {
    this.selectedStatus = null;
    this.searchTerm = '';
    this.filteredCheques = [...this.cheques];
  }

  printBankSlip(chequeId: number): void {
    this.chequeService.printBankSlip(chequeId).subscribe({
      next: (blob) => {
        // Create a blob URL and open in a new window
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (error) => {
        this.snackBar.open(`Error printing bank slip: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  viewChequeDetails(cheque: Cheque): void {
    // This would ideally show a dialog with more details
    this.snackBar.open('Cheque details view will be available soon.', 'Close', {
      duration: 3000
    });
  }

  getStatusClass(status: ChequeStatus): string {
    switch (status) {
      case ChequeStatus.NOT_RECEIVED: return 'not-received';
      case ChequeStatus.RECEIVED: return 'received';
      case ChequeStatus.SENT_FOR_CLEARANCE: return 'sent-for-clearance';
      case ChequeStatus.CLEARED: return 'cleared';
      case ChequeStatus.BOUNCED: return 'bounced';
      default: return '';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
