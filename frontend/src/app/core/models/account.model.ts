export enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  FIXED_DEPOSIT = 'FIXED_DEPOSIT'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export interface Account {
  id: number;
  accountNumber: string;
  userId: number;
  accountType: AccountType;
  balance: number;
  status: AccountStatus;
  createdDate: Date;
  lastUpdated: Date;
}

export interface SavingsAccount extends Account {
  interestRate: number;
  minimumBalance: number;
  maxDailyWithdrawalAmount: number;
}

export interface CurrentAccount extends Account {
  hasOverdraft: boolean;
  overdraftLimit: number;
  overdraftInterestRate: number;
}

export interface FixedDepositAccount extends Account {
  maturityDate: Date;
  interestRate: number;
  term: number; // in months
  maturityAmount: number;
  principalAmount: number;
}

export interface NewAccountRequest {
  accountType: AccountType;
  initialDeposit?: number;
  term?: number; // only for Fixed Deposit
}
