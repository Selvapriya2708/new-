import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Bill, BillPaymentRequest } from '../models/bill.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  
  constructor(private http: HttpClient) { }
  
  payBill(billPayment: BillPaymentRequest): Observable<Bill> {
    return this.http.post<Bill>(`${environment.apiUrl}/bills/pay`, billPayment)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to process bill payment'));
        })
      );
  }
  
  getBillsByAccount(accountId: number): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${environment.apiUrl}/bills/account/${accountId}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch bills'));
        })
      );
  }
  
  getBillById(id: number): Observable<Bill> {
    return this.http.get<Bill>(`${environment.apiUrl}/bills/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch bill details'));
        })
      );
  }
  
  getScheduledBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${environment.apiUrl}/bills/scheduled`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch scheduled bills'));
        })
      );
  }
  
  cancelScheduledBill(billId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/bills/scheduled/${billId}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to cancel scheduled bill'));
        })
      );
  }
  
  getSupportedBillProviders(): Observable<{ [key: string]: string[] }> {
    return this.http.get<{ [key: string]: string[] }>(`${environment.apiUrl}/bills/providers`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch bill providers'));
        })
      );
  }
}
