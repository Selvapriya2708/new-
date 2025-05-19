import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { FixedDepositListComponent } from './fixed-deposit-list/fixed-deposit-list.component';

const routes: Routes = [
  { path: '', component: FixedDepositListComponent }
];

@NgModule({
  declarations: [
    FixedDepositListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class FixedDepositsModule { }
