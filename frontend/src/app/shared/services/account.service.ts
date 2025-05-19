import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account, NewAccountRequest } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) { }

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }

  getAccountById(accountId: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${accountId}`);
  }

  getAccountsSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }

  requestNewAccount(accountRequest: NewAccountRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/request`, accountRequest);
  }

  getFixedDepositRates(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/fixed-deposit/rates`);
  }

  getSavingsAccountInterestRate(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/savings/interest-rate`);
  }

  getCurrentAccountOverdraftRate(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/current/overdraft-rate`);
  }

  getSavingsAccountMinimumBalance(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/savings/minimum-balance`);
  }

  getSavingsAccountDailyWithdrawalLimit(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/savings/daily-withdrawal-limit`);
  }
}
