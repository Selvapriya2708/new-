import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { ChequeService } from '../../../core/services/cheque.service';
import { Account } from '../../../core/models/account.model';
import { Cheque, ChequeStatus } from '../../../core/models/cheque.model';

@Component({
  selector: 'app-cheque-status',
  templateUrl: './cheque-status.component.html',
  styleUrls: ['./cheque-status.component.scss']
})
export class ChequeStatusComponent implements OnInit {
  accounts: Account[] = [];
  cheques: Cheque[] = [];
  isLoading = true;
  
  displayedColumns: string[] = ['slipNumber', 'depositDate', 'chequeNumber', 'amount', 'bankName', 'status', 'actions'];
  dataSource = new MatTableDataSource<Cheque>([]);
  
  // For filtering by status
  selectedStatus: string = 'ALL';
  selectedAccountId: number | null = null;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  
  // Cheque statuses
  chequeStatuses = Object.values(ChequeStatus);
  
  constructor(
    private accountService: AccountService,
    private chequeService: ChequeService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAccounts();
  }
  
  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: accounts => {
        // Filter out Fixed Deposit accounts since they don't allow deposits
        this.accounts = accounts.filter(account => account.accountType !== 'FIXED_DEPOSIT');
        
        if (this.accounts.length > 0) {
          this.selectedAccountId = this.accounts[0].id;
          this.loadCheques(this.selectedAccountId);
        } else {
          this.isLoading = false;
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
  
  loadCheques(accountId: number): void {
    this.isLoading = true;
    this.selectedAccountId = accountId;
    
    this.chequeService.getChequesByAccount(accountId).subscribe({
      next: cheques => {
        this.cheques = cheques;
        this.filterCheques();
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open(`Error loading cheques: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  filterCheques(): void {
    let filteredCheques = [...this.cheques];
    
    // Filter by status if not "ALL"
    if (this.selectedStatus !== 'ALL') {
      filteredCheques = filteredCheques.filter(cheque => cheque.status === this.selectedStatus);
    }
    
    this.dataSource = new MatTableDataSource<Cheque>(filteredCheques);
    
    // Add sorting and pagination after data is loaded
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      
      // Custom sort for date
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'depositDate':
            return new Date(item.depositDate).getTime();
          default:
            return (item as any)[property];
        }
      };
    });
  }
  
  onAccountChange(accountId: number): void {
    this.loadCheques(accountId);
  }
  
  onStatusTabChange(index: number): void {
    if (index === 0) {
      this.selectedStatus = 'ALL';
    } else {
      this.selectedStatus = this.chequeStatuses[index - 1];
    }
    
    this.filterCheques();
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
  
  navigateToChequeDeposit(): void {
    this.router.navigate(['/cheques/deposit']);
  }
  
  getChequeStatusLabel(status: string): string {
    return status.replace('_', ' ');
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case ChequeStatus.CLEARED:
        return 'status-cleared';
      case ChequeStatus.BOUNCED:
        return 'status-bounced';
      case ChequeStatus.SENT_FOR_CLEARANCE:
        return 'status-clearing';
      case ChequeStatus.RECEIVED:
        return 'status-received';
      case ChequeStatus.NOT_RECEIVED:
      default:
        return 'status-not-received';
    }
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
  
  getAccountLabel(account: Account): string {
    return `${account.accountNumber} (${account.accountType === 'SAVINGS' ? 'Savings' : 'Current'})`;
  }
}
