export enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  FIXED_DEPOSIT = 'FIXED_DEPOSIT'
}

export interface Account {
  id: number;
  accountNumber: string;
  type: string;
  balance: number;
  openingDate: Date;
  minimumBalance?: number;
  dailyWithdrawalLimit?: number;
  interestRate?: number;
  overdraftLimit?: number;
  overdraftInterestRate?: number;
  term?: number;
  maturityDate?: Date;
  maturityAmount?: number;
}

export interface NewAccountRequest {
  userId: number;
  accountType: AccountType;
  initialDeposit: number;
  overdraftFacility?: boolean;
  term?: number;
}
