import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared';
import { UserGroupsRoutingModule } from './user-groups-routing.module';
import { UserGroupsComponent } from './user-groups.component';
import { UserGroupMembersComponent } from './user-group-members/user-group-members.component';
import { ScoresComponent } from './scores/scores.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { TopUsersComponent } from './top-users/top-users.component';


@NgModule({
  imports: [
    SharedModule,
    UserGroupsRoutingModule
  ],
  declarations: [
    UserGroupsComponent,
    UserGroupMembersComponent,
    ScoresComponent,
    CertificatesComponent,
    TopUsersComponent
  ]
})
export class UserGroupsModule { }
