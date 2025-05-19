import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { DepositChequeComponent } from './deposit-cheque/deposit-cheque.component';
import { ChequeStatusComponent } from './cheque-status/cheque-status.component';

const routes: Routes = [
  { path: 'deposit', component: DepositChequeComponent },
  { path: 'status', component: ChequeStatusComponent },
  { path: '', redirectTo: 'status', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    DepositChequeComponent,
    ChequeStatusComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ChequesModule { }
