import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { platformBrowser } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();

  // suppress used console functions except error one in production mode
  console.debug = ()=>{};
  // console.error = ()=>{};
  console.log = ()=>{};
  console.trace = ()=>{};
  console.warn = ()=>{};
}

platformBrowser().bootstrapModule(AppModule)
  .catch(err => console.error(err));
