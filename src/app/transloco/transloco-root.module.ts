import { HttpClient } from '@angular/common/http';
import {
  Translation,
  TranslocoLoader,
  TranslocoModule,
  provideTransloco
} from '@jsverse/transloco';
import { provideTranslocoLocale, TranslocoLocaleModule } from '@jsverse/transloco-locale';
import { Injectable, NgModule } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string) {
    console.log('transloco-root.module/getTranslation lang='+lang);
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}

@NgModule({
  exports: [TranslocoModule],
  imports: [TranslocoLocaleModule],
  providers: [
    provideTransloco({
      config: {
        availableLangs: [{ id: 'en', label: 'English' }, { id: 'hu', label: 'Magyar' }],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoLocale({
      langToLocaleMapping: {
        en: 'en-US',
        hu: 'hu-HU'
      }
    })
  ],
})
export class TranslocoRootModule {}
