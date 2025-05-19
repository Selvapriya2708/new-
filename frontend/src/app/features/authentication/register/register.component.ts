import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  accountTypes = [
    { value: 'SAVINGS', label: 'Savings Account' },
    { value: 'CURRENT', label: 'Current Account' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      accountType: ['SAVINGS', [Validators.required]],
      address: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dateOfBirth: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.mustMatch('password', 'confirmPassword')
    });

    // If already logged in, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  // Custom validator to make sure passwords match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    const registrationData = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      email: this.f['email'].value,
      username: this.f['username'].value,
      password: this.f['password'].value,
      accountType: this.f['accountType'].value,
      address: this.f['address'].value,
      phoneNumber: this.f['phoneNumber'].value,
      dateOfBirth: this.f['dateOfBirth'].value
    };

    this.authService.register(registrationData)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.success = 'Registration request submitted successfully! The bank will review your application and send you a confirmation letter once approved.';
          this.registerForm.reset();
          this.submitted = false;
        },
        error: err => {
          this.error = err.message || 'Registration failed. Please try again.';
        }
      });
  }
}
