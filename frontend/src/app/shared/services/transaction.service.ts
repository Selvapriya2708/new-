import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transaction, TransferRequest, StatementRequest } from '../models/transaction.model';
import { Cheque, ChequeDepositRequest } from '../models/cheque.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getRecentTransactions(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/account/${accountId}/recent`);
  }

  getMiniStatement(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/account/${accountId}/mini-statement`);
  }

  getDetailedStatement(accountId: number, startDate: Date, endDate: Date, transactionType: string = 'ALL'): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    
    if (transactionType !== 'ALL') {
      params = params.set('type', transactionType);
    }
    
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/account/${accountId}/detailed-statement`, { params });
  }

  transferMoney(transferRequest: TransferRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/transactions/transfer`, transferRequest);
  }

  getTransferHistory(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/transfers`);
  }

  depositCheque(chequeRequest: ChequeDepositRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cheques/deposit`, chequeRequest);
  }

  getChequeHistory(): Observable<Cheque[]> {
    return this.http.get<Cheque[]>(`${this.apiUrl}/cheques`);
  }

  getChequeById(chequeId: number): Observable<Cheque> {
    return this.http.get<Cheque>(`${this.apiUrl}/cheques/${chequeId}`);
  }

  payBill(billPaymentRequest: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bill-payments`, billPaymentRequest);
  }

  getBillPaymentHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bill-payments`);
  }

  cancelBillPayment(billPaymentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/bill-payments/${billPaymentId}`);
  }
}
