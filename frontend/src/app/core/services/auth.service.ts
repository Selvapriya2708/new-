import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, JwtAuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus = this.authStatusSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/api`;
  private failedLoginAttempts = 0;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
    this.updateAuthStatus();
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        localStorage.removeItem('currentUser');
        return null;
      }
    }
    return null;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<JwtAuthResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        map(response => {
          // Store user details and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('jwt_token', response.token);
          
          this.currentUserSubject.next(response.user);
          this.resetFailedLoginAttempts();
          this.updateAuthStatus();
          
          return response.user;
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  logout(): void {
    // Remove user from local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwt_token');
    
    this.currentUserSubject.next(null);
    this.updateAuthStatus();
  }

  isAuthenticated(): boolean {
    const currentUser = this.currentUserValue;
    const token = localStorage.getItem('jwt_token');
    return !!currentUser && !!token;
  }

  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts++;
    
    if (this.failedLoginAttempts >= 3) {
      this.lockAccount().subscribe();
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
  }

  lockAccount(): Observable<any> {
    const userId = this.currentUserValue?.id;
    if (!userId) {
      return new Observable(observer => observer.complete());
    }
    
    return this.http.post(`${this.apiUrl}/users/${userId}/lock`, {});
  }

  updateAuthStatus(): void {
    this.authStatusSubject.next(this.isAuthenticated());
  }
}