import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { NoAuthGuard } from './no-auth-guard.service';

import RouterUrls from 'src/app/core/constants/router-urls.json';

const routes: Routes = [
  {
    path: RouterUrls.LOGIN,
    component: AuthComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: RouterUrls.REGISTER,
    component: AuthComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: RouterUrls.RESET_PASSWORD,
    component: AuthComponent,
    canActivate: [NoAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
