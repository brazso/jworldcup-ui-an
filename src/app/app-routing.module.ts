import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthorityGuard } from 'src/app/core/services/authority.guard';

/* Used roles:
ROLE_USER - normal user
ROLE_ADMIN - administrator user
*/
const routes: Routes = [
//   {
//     path: 'dummy-jack',
//     canActivate: [AuthorityGuard],
//     data: {rolesAllowed: ['ROLE_USER', 'ROLE_ADMIN']},
// //    loadChildren: () => import('./feature/dummy-jack/dummy-jack.module')
// //      .then(m => m.DummyJackModule)
//   }
];

@NgModule({
  imports: [RouterModule.forRoot(routes/*, { enableTracing: true }*/)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
