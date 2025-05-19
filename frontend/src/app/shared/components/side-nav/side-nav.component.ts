import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard', active: false },
    { label: 'Accounts', icon: 'credit-card', route: '/accounts', active: false },
    { label: 'Fixed Deposits', icon: 'trending-up', route: '/fixed-deposits', active: false },
    { label: 'Transactions', icon: 'refresh-cw', route: '/transactions', active: false },
    { label: 'Cheque Deposit', icon: 'file-text', route: '/cheque-deposit', active: false },
    { label: 'Cheque Status', icon: 'check-circle', route: '/cheque-status', active: false },
    { label: 'Bill Payment', icon: 'dollar-sign', route: '/bill-payment', active: false },
    { label: 'Money Transfer', icon: 'send', route: '/money-transfer', active: false }
  ];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      this.setActiveRoute(url);
    });
  }

  setActiveRoute(url: string): void {
    this.navItems.forEach(item => {
      item.active = url === item.route;
    });
  }
}
