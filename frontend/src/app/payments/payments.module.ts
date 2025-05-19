import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { BillPaymentComponent } from './bill-payment/bill-payment.component';
import { MoneyTransferComponent } from './money-transfer/money-transfer.component';

const routes: Routes = [
  { path: 'bill-payment', component: BillPaymentComponent },
  { path: 'money-transfer', component: MoneyTransferComponent },
  { path: '', redirectTo: 'bill-payment', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    BillPaymentComponent,
    MoneyTransferComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class PaymentsModule { }
