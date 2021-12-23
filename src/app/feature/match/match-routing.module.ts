import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorityGuard } from 'src/app/core/services';
import { MatchesComponent } from './matches/matches.component';

import RouterUrls from 'src/app/core/constants/router-urls.json';

const routes: Routes = [
  {
    path: RouterUrls.MATCHES,
    component: MatchesComponent,
    canActivate: [AuthorityGuard],
    data: { rolesAllowed: ['ROLE_USER', 'ROLE_ADMIN'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MatchRoutingModule { }
