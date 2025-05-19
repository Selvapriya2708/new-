export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  BILL_PAYMENT = 'BILL_PAYMENT',
  CHEQUE_DEPOSIT = 'CHEQUE_DEPOSIT',
  INTEREST_CREDIT = 'INTEREST_CREDIT',
  CHARGES = 'CHARGES'
}

export interface Transaction {
  id: number;
  accountId: number;
  type: string;
  amount: number;
  description: string;
  reference: string;
  timestamp: Date;
  balanceAfter: number;
  
  // For transfers
  sourceAccountId?: number;
  sourceAccountNumber?: string;
  destinationAccountId?: number;
  destinationAccountNumber?: string;
}

export interface TransferRequest {
  sourceAccountId: number;
  destinationAccountNumber: string;
  amount: number;
  description: string;
}

export interface StatementRequest {
  accountId: number;
  startDate: Date;
  endDate: Date;
  transactionType: string;
}
