import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../core/services/account.service';
import { FixedDeposit } from '../../../core/models/account.model';
import { finalize } from 'rxjs/operators';

interface FDRateInfo {
  term: number;
  rate: number;
}

@Component({
  selector: 'app-fixed-deposit',
  templateUrl: './fixed-deposit.component.html',
  styleUrls: ['./fixed-deposit.component.scss']
})
export class FixedDepositComponent implements OnInit {
  fixedDeposits: FixedDeposit[] = [];
  loading = true;
  error = '';
  
  // Interest rate information as per requirements
  fdRateInfo: FDRateInfo[] = [
    { term: 12, rate: 4.5 },
    { term: 24, rate: 5.0 },
    { term: 36, rate: 5.5 }
  ];
  
  // For charts/visualization 
  chartLabels: string[] = [];
  chartData: number[] = [];
  chartColors: string[] = [];

  constructor(
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.loadFixedDeposits();
  }

  loadFixedDeposits(): void {
    this.loading = true;
    this.error = '';

    this.accountService.getFixedDeposits()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (deposits) => {
          this.fixedDeposits = deposits;
          this.prepareChartData();
        },
        error: (err) => {
          this.error = 'Failed to load fixed deposit accounts. Please try again later.';
          console.error('Error loading fixed deposits:', err);
        }
      });
  }

  prepareChartData(): void {
    // Reset data
    this.chartLabels = [];
    this.chartData = [];
    this.chartColors = [];
    
    // Skip if no data
    if (this.fixedDeposits.length === 0) return;
    
    // Generate random colors for the chart
    const colorPalette = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];
    
    // Prepare data for chart
    this.fixedDeposits.forEach((deposit, index) => {
      this.chartLabels.push(`FD ${deposit.accountNumber.slice(-4)}`);
      this.chartData.push(deposit.principalAmount);
      this.chartColors.push(colorPalette[index % colorPalette.length]);
    });
  }

  getTotalInvestedAmount(): number {
    return this.fixedDeposits.reduce((sum, deposit) => sum + deposit.principalAmount, 0);
  }

  getTotalMaturityAmount(): number {
    return this.fixedDeposits.reduce((sum, deposit) => sum + deposit.maturityAmount, 0);
  }

  getTotalEarnings(): number {
    return this.getTotalMaturityAmount() - this.getTotalInvestedAmount();
  }

  getRemainingDays(maturityDate: Date): number {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = Math.abs(maturity.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getProgressPercent(openDate: Date, maturityDate: Date): number {
    const today = new Date();
    const start = new Date(openDate);
    const end = new Date(maturityDate);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = today.getTime() - start.getTime();
    
    if (elapsedDuration <= 0) return 0;
    if (elapsedDuration >= totalDuration) return 100;
    
    return Math.round((elapsedDuration / totalDuration) * 100);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'danger';
      case 'PENDING_APPROVAL': return 'warning';
      case 'CLOSED': return 'dark';
      default: return 'secondary';
    }
  }
}
