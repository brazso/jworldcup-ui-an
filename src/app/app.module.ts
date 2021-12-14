import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco/transloco-root.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule, FooterComponent, HeaderComponent } from './shared';
import { CoreModule } from './core/core.module';
import { AuthModule } from './feature/auth/auth.module';
import { SessionService } from './core/services';

// export function initUser(userService: UserService) {
//   return (): Promise<any>  => {
//     return userService.loadAndStoreUser();
//   };
// }

// app (root) module
@NgModule({
  // for Components, Directives & Pipes
  // Component cannot belong to more than one module
  declarations: [
    AppComponent, FooterComponent, HeaderComponent
  ],
  // used Modules
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslocoRootModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    AuthModule,
    FlexLayoutModule
  ],
  // for Services (Guards can be considered to Services)
  providers: [
    SessionService,
    // { provide: APP_INITIALIZER, useFactory: initUser, deps: [UserService], multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: DateParserInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor() {
    this.overrideDate();
  }

  overrideDate() {
    /**
     * Overwritten Date.toJson method, so that the backend do receive the local datetime at HTTP REST API calls in the requests.
     * Otherwise there might be 1-2 hours offset owning to UTC (backend) and CET (browser) timezones's difference and the possible 
     * DST usage. Example for the output: 2021-04-22T14:48:00.000Z
     */
    Date.prototype.toJSON = function (key) {
      const thisUTC = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(),
        this.getMinutes(), this.getSeconds()));
      return thisUTC.toISOString();
    };
  }  
}
