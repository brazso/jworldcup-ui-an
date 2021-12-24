import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AuthComponent } from './auth.component';
import { NoAuthGuard } from './no-auth-guard.service';
import { SharedModule } from 'src/app/shared';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AuthRoutingModule,
    FlexLayoutModule
  ],
  declarations: [
    AuthComponent
  ],
  providers: [
    NoAuthGuard
  ]
})
export class AuthModule {}
