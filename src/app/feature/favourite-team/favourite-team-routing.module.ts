import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityGuard } from 'src/app/core/services';
import { FavouriteTeamComponent } from './favourite-team.component';

import RouterUrls from 'src/app/core/constants/router-urls.json';

const routes: Routes = [
  {
    path: RouterUrls.FAVOURITE_TEAM,
    component: FavouriteTeamComponent,
    canActivate: [AuthorityGuard],
    data: { rolesAllowed: ['ROLE_USER'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FavouriteTeamRoutingModule { }
