import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
}

interface Transaction {
  id: number;
  date: Date;
  description: string;
  amount: number;
  type: string;
  balance: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  loading = false;

  displayedColumns: string[] = ['date', 'description', 'amount', 'balance'];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Check if user is logged in
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = JSON.parse(userJson);
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Simulate loading data from backend
    setTimeout(() => {
      // Sample accounts data
      this.accounts = [
        {
          id: 1,
          accountNumber: '1234567890',
          accountType: 'SAVINGS',
          balance: 5482.75,
          status: 'ACTIVE'
        },
        {
          id: 2,
          accountNumber: '0987654321',
          accountType: 'CURRENT',
          balance: 12750.50,
          status: 'ACTIVE'
        }
      ];
      
      // Sample recent transactions
      this.recentTransactions = [
        {
          id: 1,
          date: new Date(2023, 4, 15),
          description: 'Salary Credit',
          amount: 3500.00,
          type: 'CREDIT',
          balance: 5482.75
        },
        {
          id: 2,
          date: new Date(2023, 4, 10),
          description: 'Online Purchase - Amazon',
          amount: -128.50,
          type: 'DEBIT',
          balance: 1982.75
        },
        {
          id: 3,
          date: new Date(2023, 4, 8),
          description: 'ATM Withdrawal',
          amount: -200.00,
          type: 'DEBIT',
          balance: 2111.25
        },
        {
          id: 4,
          date: new Date(2023, 4, 5),
          description: 'Bill Payment - Electricity',
          amount: -75.25,
          type: 'DEBIT',
          balance: 2311.25
        },
        {
          id: 5,
          date: new Date(2023, 4, 1),
          description: 'Fund Transfer from John Doe',
          amount: 250.00,
          type: 'CREDIT',
          balance: 2386.50
        }
      ];
      
      this.loading = false;
    }, 1000);
  }

  getAccountTypeLabel(type: string): string {
    switch (type) {
      case 'SAVINGS':
        return 'Savings Account';
      case 'CURRENT':
        return 'Current Account';
      case 'FIXED_DEPOSIT':
        return 'Fixed Deposit';
      default:
        return type;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  navigateToAccountDetails(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }

  navigateToMiniStatement(accountId: number): void {
    this.router.navigate(['/accounts', accountId, 'mini-statement']);
  }

  navigateToDetailedStatement(accountId: number): void {
    this.router.navigate(['/accounts', accountId, 'detailed-statement']);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
    this.snackBar.open('You have been logged out successfully', 'Close', {
      duration: 3000
    });
  }

  navigateToChequeDeposit(): void {
    this.router.navigate(['/cheques/deposit']);
  }

  navigateToBillPayment(): void {
    this.router.navigate(['/bills/pay']);
  }

  navigateToMoneyTransfer(): void {
    this.router.navigate(['/transactions/transfer']);
  }
}