import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  Account, 
  SavingsAccount, 
  CurrentAccount, 
  FixedDepositAccount, 
  NewAccountRequest, 
  AccountType 
} from '../models/account.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  
  constructor(private http: HttpClient) { }
  
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${environment.apiUrl}/accounts`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch accounts'));
        })
      );
  }
  
  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${environment.apiUrl}/accounts/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch account details'));
        })
      );
  }
  
  getSavingsAccount(id: number): Observable<SavingsAccount> {
    return this.http.get<SavingsAccount>(`${environment.apiUrl}/accounts/savings/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch savings account details'));
        })
      );
  }
  
  getCurrentAccount(id: number): Observable<CurrentAccount> {
    return this.http.get<CurrentAccount>(`${environment.apiUrl}/accounts/current/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch current account details'));
        })
      );
  }
  
  getFixedDepositAccount(id: number): Observable<FixedDepositAccount> {
    return this.http.get<FixedDepositAccount>(`${environment.apiUrl}/accounts/fixed-deposit/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch fixed deposit account details'));
        })
      );
  }
  
  createAccount(accountRequest: NewAccountRequest): Observable<Account> {
    return this.http.post<Account>(`${environment.apiUrl}/accounts`, accountRequest)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to create account'));
        })
      );
  }
  
  getAccountBalance(id: number): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${environment.apiUrl}/accounts/${id}/balance`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch account balance'));
        })
      );
  }
  
  getSavingsInterestRate(): Observable<{ rate: number }> {
    return this.http.get<{ rate: number }>(`${environment.apiUrl}/accounts/savings/interest-rate`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch savings interest rate'));
        })
      );
  }
  
  getCurrentOverdraftRate(): Observable<{ rate: number }> {
    return this.http.get<{ rate: number }>(`${environment.apiUrl}/accounts/current/overdraft-rate`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch current account overdraft rate'));
        })
      );
  }
  
  getFixedDepositRates(): Observable<{ [key: number]: number }> {
    return this.http.get<{ [key: number]: number }>(`${environment.apiUrl}/accounts/fixed-deposit/rates`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error.message || 'Failed to fetch fixed deposit rates'));
        })
      );
  }
}
