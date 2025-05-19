import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { UserRegistration, AccountType } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  accountTypes = [
    { value: 'SAVINGS', viewValue: 'Savings Account' },
    { value: 'CURRENT', viewValue: 'Current Account' }
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/home']);
    }
    
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', [Validators.required]],
      accountType: ['SAVINGS', [Validators.required]]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
  }
  
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
  
  onSubmit(): void {
    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    const registration: UserRegistration = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phoneNumber: this.registerForm.value.phoneNumber,
      address: this.registerForm.value.address,
      accountType: this.registerForm.value.accountType
    };
    
    this.authService.register(registration).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Registration successful! Your application has been sent to the bank for approval. You will receive a confirmation letter once approved.', 'Close', {
          duration: 10000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/login']);
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open(`Registration failed: ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
