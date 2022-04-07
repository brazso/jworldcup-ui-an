import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityGuard } from 'src/app/core/services';
import { UserGroupsComponent } from './user-groups.component';

import RouterUrls from 'src/app/core/constants/router-urls.json';
import { ScoresComponent } from './scores/scores.component';
import { CertificatesComponent } from './certificates/certificates.component';

const routes: Routes = [
  {
    path: RouterUrls.USER_GROUPS,
    component: UserGroupsComponent,
    canActivate: [AuthorityGuard],
    data: { rolesAllowed: ['ROLE_ADMIN', 'ROLE_USER'] }
  },
  {
    path: RouterUrls.SCORES,
    component: ScoresComponent,
    canActivate: [AuthorityGuard],
    data: { rolesAllowed: ['ROLE_ADMIN', 'ROLE_USER'] }
  },
  {
    path: RouterUrls.CERTIFICATES,
    component: CertificatesComponent,
    canActivate: [AuthorityGuard],
    data: { rolesAllowed: ['ROLE_ADMIN', 'ROLE_USER'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserGroupsRoutingModule { }
