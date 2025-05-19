import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        // Check for 401 Unauthorized response
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          this.authService.logout();
          errorMessage = 'Session expired. Please log in again.';
        } 
        // Check for 403 Forbidden response
        else if (error.status === 403) {
          errorMessage = 'You do not have permission to perform this action';
        }
        // Other error messages from server
        else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        // Show error message
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
