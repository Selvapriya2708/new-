import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Simulating login since we don't have a backend connected yet
    setTimeout(() => {
      // Mock successful login for demo purposes
      localStorage.setItem('currentUser', JSON.stringify({
        id: 1,
        username: this.loginForm.value.username,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      }));
      
      this.snackBar.open('Login successful', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      
      this.router.navigate(['/dashboard']);
      this.loading = false;
    }, 1500);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}