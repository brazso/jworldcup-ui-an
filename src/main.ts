import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

  // suppress used console functions except error one in production mode
  console.debug = ()=>{};
  // console.error = ()=>{};
  console.log = ()=>{};
  console.trace = ()=>{};
  console.warn = ()=>{};

if (environment.production) {
  enableProdMode();

  // suppress used console functions except error one in production mode
  console.debug = ()=>{};
  // console.error = ()=>{};
  console.log = ()=>{};
  console.trace = ()=>{};
  console.warn = ()=>{};
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
