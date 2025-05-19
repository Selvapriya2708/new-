import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus = this.authStatusSubject.asObservable();
  
  private apiUrl = `${environment.apiUrl}/${environment.apiVersion}`;
  private failedLoginAttempts = 0;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
    this.updateAuthStatus();
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(map(response => {
        // Store user details and jwt token in local storage to keep user logged in
        const user: User = {
          id: response.id,
          username: response.username,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          token: response.token
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.authStatusSubject.next(true);
        this.failedLoginAttempts = 0;
        
        return user;
      }));
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userData);
  }

  logout(): void {
    // Clear user data from local storage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.authStatusSubject.next(false);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue?.token;
  }

  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts++;
    if (this.failedLoginAttempts >= 3) {
      this.lockAccount();
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
  }

  lockAccount(): Observable<any> {
    const username = this.currentUserValue?.username;
    return this.http.post<any>(`${this.apiUrl}/auth/lock-account`, { username });
  }

  updateAuthStatus(): void {
    this.authStatusSubject.next(this.isAuthenticated());
  }
}
