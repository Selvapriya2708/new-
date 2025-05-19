import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  currentUser: User;
  isExpanded = true;
  isMobile = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    this.isExpanded = !this.isMobile;
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }

  logout(): void {
    this.authService.logout();
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'User';
  }

  getUserInitials(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`;
    }
    return 'U';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    if (this.isMobile) {
      this.isExpanded = false;
    }
  }
}
