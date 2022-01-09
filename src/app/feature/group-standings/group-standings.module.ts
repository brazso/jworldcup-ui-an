import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared';
import { GroupStandingsRoutingModule } from './group-standings-routing.module';
import { GroupStandingsComponent } from './group-standings.component';


@NgModule({
  imports: [
    SharedModule,
    GroupStandingsRoutingModule
  ],
  declarations: [
    GroupStandingsComponent
  ]
})
export class GroupStandingsModule { }
