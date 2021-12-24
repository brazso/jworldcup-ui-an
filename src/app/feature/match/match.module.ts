import { NgModule } from '@angular/core';

import { MatchRoutingModule } from './match-routing.module';
import { MatchesComponent } from './matches/matches.component';
import { SharedModule } from 'src/app/shared';


@NgModule({
  imports: [
    SharedModule,
    MatchRoutingModule
  ],
  declarations: [
    MatchesComponent
  ]
})
export class MatchModule { }
