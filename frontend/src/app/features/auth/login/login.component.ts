import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { LoginCredentials } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  returnUrl: string = '/';
  hidePassword = true;
  loginAttempts = 0;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    // Redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/home']);
    }
    
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }
  
  onSubmit(): void {
    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    const credentials: LoginCredentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };
    
    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: error => {
        this.isLoading = false;
        this.loginAttempts++;
        
        // Check if account should be locked (after 3 failed attempts)
        if (this.loginAttempts >= 3) {
          this.snackBar.open('Your account has been locked due to multiple failed login attempts. Please contact customer support.', 'Close', {
            duration: 10000,
            panelClass: ['error-snackbar']
          });
          this.loginForm.disable();
        } else {
          this.snackBar.open(`Login failed: ${error.message}. Attempts remaining: ${3 - this.loginAttempts}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }
  
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
