import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, RegisterRequest, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  register(registerData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          // Store user details and JWT token in local storage to keep user logged in
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
          return response;
        })
      );
  }

  logout(): void {
    // Remove user from local storage to log user out
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue && !!localStorage.getItem('token');
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, password });
  }

  getToken(): string {
    return localStorage.getItem('token');
  }

  refreshToken(): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh-token`, {})
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          return response;
        })
      );
  }
}
