import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityGuard } from 'src/app/core/services';
import { GroupStandingsComponent } from './group-standings.component';

import RouterUrls from 'src/app/core/constants/router-urls.json';

const routes: Routes = [
  {
    path: RouterUrls.GROUP_STANDINGS,
    component: GroupStandingsComponent,
    canActivate: [AuthorityGuard],
    data: { rolesAllowed: ['ROLE_ADMIN', 'ROLE_USER'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupStandingsRoutingModule { }
