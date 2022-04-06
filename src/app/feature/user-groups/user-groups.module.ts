import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared';
import { UserGroupsRoutingModule } from './user-groups-routing.module';
import { UserGroupsComponent } from './user-groups.component';
import { UserGroupMembersComponent } from './user-group-members/user-group-members.component';
import { ScoresComponent } from './scores/scores.component';


@NgModule({
  imports: [
    SharedModule,
    UserGroupsRoutingModule
  ],
  declarations: [
    UserGroupsComponent,
    UserGroupMembersComponent,
    ScoresComponent
  ]
})
export class UserGroupsModule { }