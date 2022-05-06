import { NgModule } from '@angular/core';

import { BetRoutingModule } from './bet-routing.module';
import { BetsComponent } from './bets/bets.component';
import { SharedModule } from 'src/app/shared';
import { BetComponent } from './bet.component';
import { OtherBetsComponent } from './other-bets/other-bets.component';


@NgModule({
  imports: [
    SharedModule,
    BetRoutingModule
  ],
  declarations: [
    BetsComponent,
    BetComponent,
    OtherBetsComponent,
  ]
})
export class BetModule { }
