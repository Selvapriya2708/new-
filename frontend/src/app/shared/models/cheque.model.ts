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
  chequeNumber: string;
  amount: number;
  bankName: string;
  branchName: string;
  chequeDate: Date;
  submissionDate: Date;
  status: string;
  clearanceDate?: Date;
  bounceReason?: string;
  remarks?: string;
}

export interface ChequeDepositRequest {
  accountId: number;
  chequeNumber: string;
  amount: number;
  bankName: string;
  branchName: string;
  chequeDate: Date;
}
