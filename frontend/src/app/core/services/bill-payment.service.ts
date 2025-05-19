import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BillPayment, Biller, BillerCategory } from '../models/bill-payment.model';

@Injectable({
  providedIn: 'root'
})
export class BillPaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;
  
  constructor(private http: HttpClient) { }

  getBillers(): Observable<Biller[]> {
    return this.http.get<Biller[]>(`${this.apiUrl}/billers`);
  }

  getBillersByCategory(category: BillerCategory): Observable<Biller[]> {
    return this.http.get<Biller[]>(`${this.apiUrl}/billers/category/${category}`);
  }

  getBillerDetails(id: number): Observable<Biller> {
    return this.http.get<Biller>(`${this.apiUrl}/billers/${id}`);
  }

  payBill(paymentData: {
    accountId: number,
    billerId: number,
    amount: number,
    reference: string,
    description?: string,
    scheduledDate?: Date
  }): Observable<BillPayment> {
    return this.http.post<BillPayment>(`${this.apiUrl}/bill`, paymentData);
  }

  getPaymentHistory(): Observable<BillPayment[]> {
    return this.http.get<BillPayment[]>(`${this.apiUrl}/bill/history`);
  }

  getScheduledPayments(): Observable<BillPayment[]> {
    return this.http.get<BillPayment[]>(`${this.apiUrl}/bill/scheduled`);
  }

  cancelScheduledPayment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bill/${id}`);
  }
}
