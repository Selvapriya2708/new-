import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { MiniStatementComponent } from './mini-statement/mini-statement.component';
import { DetailedStatementComponent } from './detailed-statement/detailed-statement.component';

const routes: Routes = [
  { path: '', component: AccountListComponent },
  { path: 'savings', component: AccountListComponent, data: { accountType: 'SAVINGS' } },
  { path: 'current', component: AccountListComponent, data: { accountType: 'CURRENT' } },
  { path: ':id', component: AccountDetailComponent },
  { path: ':id/mini-statement', component: MiniStatementComponent },
  { path: 'mini-statement', component: MiniStatementComponent },
  { path: 'detailed-statement', component: DetailedStatementComponent }
];

@NgModule({
  declarations: [
    AccountListComponent,
    AccountDetailComponent,
    MiniStatementComponent,
    DetailedStatementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AccountsModule { }
