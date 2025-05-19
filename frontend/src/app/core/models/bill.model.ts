export enum BillType {
  ELECTRICITY = 'ELECTRICITY',
  TELEPHONE = 'TELEPHONE',
  WATER = 'WATER',
  INTERNET = 'INTERNET',
  MOBILE = 'MOBILE',
  GAS = 'GAS',
  OTHER = 'OTHER'
}

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED'
}

export interface Bill {
  id: number;
  accountId: number;
  billType: BillType;
  billNumber: string;
  amount: number;
  dueDate: Date;
  paymentDate?: Date;
  scheduledDate?: Date;
  status: BillStatus;
  provider: string;
  description?: string;
  reference: string;
}

export interface BillPaymentRequest {
  accountId: number;
  billType: BillType;
  billNumber: string;
  amount: number;
  provider: string;
  description?: string;
  payNow: boolean;
  scheduledDate?: Date;
}
