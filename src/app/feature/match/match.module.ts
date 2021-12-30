import { NgModule } from '@angular/core';

import { MatchRoutingModule } from './match-routing.module';
import { MatchesComponent } from './matches/matches.component';
import { SharedModule } from 'src/app/shared';
import { MatchComponent } from './match.component';


@NgModule({
  imports: [
    SharedModule,
    MatchRoutingModule
  ],
  declarations: [
    MatchesComponent,
    MatchComponent,
  ]
})
export class MatchModule { }
