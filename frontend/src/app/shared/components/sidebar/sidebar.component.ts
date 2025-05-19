import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/home'
    },
    {
      label: 'Accounts',
      icon: 'account_balance',
      children: [
        {
          label: 'View All Accounts',
          icon: 'list',
          route: '/accounts'
        },
        {
          label: 'Open New Account',
          icon: 'add',
          route: '/accounts/new'
        }
      ],
      expanded: false
    },
    {
      label: 'Transactions',
      icon: 'swap_horiz',
      route: '/transactions'
    },
    {
      label: 'Cheque Services',
      icon: 'money',
      children: [
        {
          label: 'Deposit Cheque',
          icon: 'add_circle',
          route: '/cheques/deposit'
        },
        {
          label: 'Cheque Status',
          icon: 'query_builder',
          route: '/cheques/status'
        }
      ],
      expanded: false
    },
    {
      label: 'Bill Payments',
      icon: 'receipt',
      route: '/bills/payment'
    },
    {
      label: 'Money Transfer',
      icon: 'send',
      route: '/transfers'
    }
  ];
  
  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  
  toggleExpand(item: NavItem): void {
    item.expanded = !item.expanded;
  }
  
  navigate(route: string | undefined): void {
    if (route) {
      this.router.navigate([route]);
    }
  }
}
