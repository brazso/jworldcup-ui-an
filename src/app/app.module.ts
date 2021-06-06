import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { UserService } from 'src/app/core/services/user.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslocoRootModule } from './transloco/transloco-root.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpConfigInterceptor } from './core/interceptors/http-config.interceptor';
import { DateParserInterceptor } from './core/interceptors/date-parser.interceptor';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

export function initUser(userService: UserService) {
  return (): Promise<any>  => {
    return userService.loadAndStoreUser();
  };
}

// app (root) module
@NgModule({
  // for Components, Directives & Pipes
  // Component cannot belong to more than one module
  declarations: [
    AppComponent
  ],
  // used Modules
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslocoRootModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule
  ],
  // for Services (Guards can be considered to Services)
  providers: [
    UserService,
    { provide: APP_INITIALIZER, useFactory: initUser, deps: [UserService], multi: true },
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
