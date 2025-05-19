export enum ChequeStatus {
  NOT_RECEIVED = 'NOT_RECEIVED',
  RECEIVED = 'RECEIVED',
  SENT_FOR_CLEARANCE = 'SENT_FOR_CLEARANCE',
  CLEARED = 'CLEARED',
  BOUNCED = 'BOUNCED'
}

export interface Cheque {
  id: number;
  accountId: number;
  accountNumber: string;
  chequeNumber: string;
  amount: number;
  payeeName: string;
  bankName: string;
  branchName: string;
  depositDate: Date;
  clearanceDate?: Date;
  status: ChequeStatus;
  remarks?: string;
  slipNumber: string;
}

export interface ChequeDepositRequest {
  accountId: number;
  chequeNumber: string;
  amount: number;
  payeeName: string;
  bankName: string;
  branchName: string;
}

export interface ChequeStatusUpdate {
  chequeId: number;
  newStatus: ChequeStatus;
  remarks?: string;
  clearanceDate?: Date;
}
