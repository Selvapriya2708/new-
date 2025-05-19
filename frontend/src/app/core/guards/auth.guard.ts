import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Check if user is logged in
    if (this.authService.currentUserValue) {
      // Verify token validity with server
      return this.authService.checkUserStatus().pipe(
        map(() => true),
        catchError(() => {
          // If token is invalid, redirect to login
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return of(false);
        })
      );
    } else {
      // Not logged in, redirect to login page with return url
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}
