import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatchRoutingModule } from './match-routing.module';
import { MatchesComponent } from './matches/matches.component';


@NgModule({
  declarations: [
    MatchesComponent
  ],
  imports: [
    CommonModule,
    MatchRoutingModule
  ]
})
export class MatchModule { }
