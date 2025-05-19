import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Cheque, ChequeDepositRequest, ChequeStatusUpdate } from '../models/cheque.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChequeService {
  
  constructor(private http: HttpClient) { }
  
  depositCheque(depositRequest: ChequeDepositRequest): Observable<Cheque> {
    return this.http.post<Cheque>(`${environment.apiUrl}/cheques/deposit`, depositRequest)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to deposit cheque'));
        })
      );
  }
  
  getChequesByAccount(accountId: number): Observable<Cheque[]> {
    return this.http.get<Cheque[]>(`${environment.apiUrl}/cheques/account/${accountId}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch cheques'));
        })
      );
  }
  
  getChequeById(id: number): Observable<Cheque> {
    return this.http.get<Cheque>(`${environment.apiUrl}/cheques/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch cheque details'));
        })
      );
  }
  
  updateChequeStatus(statusUpdate: ChequeStatusUpdate): Observable<Cheque> {
    return this.http.put<Cheque>(`${environment.apiUrl}/cheques/status`, statusUpdate)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to update cheque status'));
        })
      );
  }
  
  getChequesByStatus(status: string): Observable<Cheque[]> {
    return this.http.get<Cheque[]>(`${environment.apiUrl}/cheques/status/${status}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch cheques by status'));
        })
      );
  }
  
  printChequeSlip(chequeId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/cheques/${chequeId}/print-slip`, { responseType: 'blob' })
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to print cheque slip'));
        })
      );
  }
}
