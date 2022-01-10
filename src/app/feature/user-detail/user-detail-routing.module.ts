import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityGuard } from 'src/app/core/services';
import { UserDetailComponent } from './user-detail.component';

import RouterUrls from 'src/app/core/constants/router-urls.json';

const routes: Routes = [
  {
    path: RouterUrls.USER_DETAIL,
    component: UserDetailComponent,
    canActivate: [AuthorityGuard],
    data: { rolesAllowed: ['ROLE_ADMIN', 'ROLE_USER'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserDetailRoutingModule { }
