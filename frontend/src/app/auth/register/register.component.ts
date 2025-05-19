import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  accountTypes = [
    { value: 'SAVINGS', label: 'Savings Account' },
    { value: 'CURRENT', label: 'Current Account' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      accountType: ['SAVINGS', [Validators.required]]
    }, {
      validators: this.mustMatch('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
  }

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
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Simulate registration process since we don't have a backend connected yet
    setTimeout(() => {
      this.snackBar.open('Registration successful! Your account is pending approval. You will receive confirmation once approved.', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      
      this.router.navigate(['/login']);
      this.loading = false;
    }, 1500);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}