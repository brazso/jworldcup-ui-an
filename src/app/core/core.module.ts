import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslocoRootModule } from '../transloco/transloco-root.module';
import { HttpTokenInterceptor } from './interceptors';
import { ApiService, 
  BackendService,
  AuthorityGuard, 
  JwtService, 
  SessionService, 
  RxStompService,
  rxStompServiceFactory} from './services';
 
@NgModule({
  imports: [
    CommonModule,
    TranslocoRootModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: DateParserInterceptor, multi: true },
    ApiService,
    AuthorityGuard,
    BackendService,
    JwtService,
    RxStompService,
    { provide: RxStompService, useFactory: rxStompServiceFactory },
    SessionService,

    // MessageService and its DialogService dependecy from primeng are used in core, search for "this.messageService"
    MessageService,
    DialogService
  ],
  declarations: []
})
export class CoreModule { 
 
  constructor(@Optional() @SkipSelf() core:CoreModule ){
    if (core) {
        throw new Error("You should import core module only in the root module")
    }
  }
}
