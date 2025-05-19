import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
  }
  
  loadCurrentUser(): void {
    this.currentUser = this.authService.currentUserValue;
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}