import { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import localeHu from '@angular/common/locales/hu';
import { getBrowserLang, LangDefinition, Translation, TranslocoService } from '@ngneat/transloco';
import { SessionData } from './core/models';
import { SessionService } from './core/services';
import { registerLocaleData } from '@angular/common';
import { PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  title: string = 'jworldcup-ui-an';

  constructor(
    private readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly sessionService: SessionService,
    private primeNGConfig: PrimeNGConfig
    // private readonly enumService: EnumService,
    // private readonly toastMessageService: ToastMessageService
    ) {
  }

  ngOnInit(): void {
    this.registerLocales();
    this.setupActiveLang();
    this.setupSession();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


  private registerLocales(): void {
    registerLocaleData(localeHu, 'hu');
  }

  private setupActiveLang(): void {
    const browserLang = getBrowserLang();
    console.log(`app.component/browserLang: ${browserLang}`);
    const defaultLang = getBrowserLang() ?? this.translocoService.getDefaultLang();
    console.log(`app.component/defaultLang: ${defaultLang}`);
    const availableLangs = this.translocoService.getAvailableLangs() as LangDefinition[]; // e.g. // [{"id":"en","label":"English"},{"id":"hu","label":"Magyar"}]
    console.log(`app.component/availableLangs: ${JSON.stringify(availableLangs)}`);
    const activeLang = availableLangs.map(e => e.id).includes(defaultLang) ? defaultLang : this.translocoService.getDefaultLang();
    console.log(`app.component/setActiveLang1: ${activeLang}`);
    this.translocoService.setActiveLang(activeLang);

    this.translocoService.selectTranslateObject('primeng').subscribe(res => {
      console.log(`app.component/primeng: ${JSON.stringify(res)}`);
      this.primeNGConfig.setTranslation(res);
    });
  }

  private setupSession(): void {
    console.log('app.component/setupSession');

    this.subscriptions.push(this.sessionService.initSession().subscribe({
      next: (session: SessionData) => {
        console.log('app.component/session.user=' + session.user?.loginName);
        this.sessionService.goToDefaultPage();
      },
      error: (err) => {
        console.log('app.component/session.user is not authenticated yet');
      }
    }));
  }

}
