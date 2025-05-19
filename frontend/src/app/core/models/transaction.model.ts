export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  BILL_PAYMENT = 'BILL_PAYMENT',
  CHEQUE_DEPOSIT = 'CHEQUE_DEPOSIT',
  INTEREST_CREDIT = 'INTEREST_CREDIT',
  OVERDRAFT_INTEREST = 'OVERDRAFT_INTEREST',
  FEE = 'FEE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED'
}

export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  description: string;
  recipientAccountId?: number;
  recipientAccountNumber?: string;
  transactionDate: Date;
  reference: string;
}

export interface StatementRequest {
  accountId: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface MiniStatement {
  transactions: Transaction[];
  accountNumber: string;
  accountType: string;
  currentBalance: number;
}

export interface DetailedStatement {
  transactions: Transaction[];
  accountNumber: string;
  accountType: string;
  startDate: Date;
  endDate: Date;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
}
