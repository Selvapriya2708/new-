import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { 
    path: 'accounts', 
    loadChildren: () => import('./accounts/accounts.module').then(m => m.AccountsModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'transactions', 
    loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'cheques', 
    loadChildren: () => import('./cheques/cheques.module').then(m => m.ChequesModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'bills', 
    loadChildren: () => import('./bills/bills.module').then(m => m.BillsModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }