import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Transaction, StatementRequest, MiniStatement, DetailedStatement } from '../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  
  constructor(private http: HttpClient) { }
  
  getTransactionsByAccount(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions/account/${accountId}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch transactions'));
        })
      );
  }
  
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${environment.apiUrl}/transactions/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch transaction details'));
        })
      );
  }
  
  getMiniStatement(accountId: number): Observable<MiniStatement> {
    return this.http.get<MiniStatement>(`${environment.apiUrl}/transactions/mini-statement/${accountId}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch mini statement'));
        })
      );
  }
  
  getDetailedStatement(request: StatementRequest): Observable<DetailedStatement> {
    let params = new HttpParams()
      .set('accountId', request.accountId.toString());
    
    if (request.startDate) {
      params = params.set('startDate', request.startDate.toISOString());
    }
    
    if (request.endDate) {
      params = params.set('endDate', request.endDate.toISOString());
    }
    
    return this.http.get<DetailedStatement>(`${environment.apiUrl}/transactions/detailed-statement`, { params })
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch detailed statement'));
        })
      );
  }
}
