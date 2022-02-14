import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared';
import { UserGroupsRoutingModule } from './user-groups-routing.module';
import { UserGroupsComponent } from './user-groups.component';


@NgModule({
  imports: [
    SharedModule,
    UserGroupsRoutingModule
  ],
  declarations: [
    UserGroupsComponent
  ]
})
export class UserGroupsModule { }
