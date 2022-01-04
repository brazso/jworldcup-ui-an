import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared';
import { FavouriteTeamRoutingModule } from './favourite-team-routing.module';
import { FavouriteTeamComponent } from './favourite-team.component';


@NgModule({
  imports: [
    SharedModule,
    FavouriteTeamRoutingModule
  ],
  declarations: [
    FavouriteTeamComponent
  ]
})
export class FavouriteTeamModule { }
