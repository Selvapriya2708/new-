export interface BillPayment {
  id: number;
  accountId: number;
  accountNumber: string;
  billerId: number;
  billerName: string;
  billerCategory: BillerCategory;
  amount: number;
  reference: string;
  description: string;
  paymentDate: Date;
  scheduledDate?: Date;
  status: BillPaymentStatus;
  transactionId?: string;
}

export enum BillerCategory {
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  TELEPHONE = 'TELEPHONE',
  MOBILE = 'MOBILE',
  CABLE_TV = 'CABLE_TV',
  INTERNET = 'INTERNET',
  GAS = 'GAS',
  INSURANCE = 'INSURANCE',
  CREDIT_CARD = 'CREDIT_CARD',
  OTHER = 'OTHER'
}

export enum BillPaymentStatus {
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Biller {
  id: number;
  name: string;
  category: BillerCategory;
  description: string;
  accountRequired: boolean;
}
