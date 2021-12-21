import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AvailableLangs, getBrowserLang, LangDefinition, Translation, TranslocoService } from '@ngneat/transloco';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { SessionData } from './core/models';
import { SessionService } from './core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly sessionService: SessionService,
    // private readonly enumService: EnumService,
    // private readonly toastMessageService: ToastMessageService
    ) {
  }

  ngOnInit(): void {
    this.setupActiveLang();
    this.setupSession();
  }

  title = 'jworldcup-ui-an';

  private setupActiveLang(): void {
    const defaultLang = getBrowserLang() ?? this.translocoService.getDefaultLang();
    console.log(`defaultLang: ${defaultLang}`);
    const availableLangs = this.translocoService.getAvailableLangs() as LangDefinition[]; // e.g. // [{"id":"en","label":"English"},{"id":"hu","label":"Magyar"}]
    console.log(`availableLangs: ${JSON.stringify(availableLangs)}`);
    const activeLang = availableLangs.map(e => e.id).includes(defaultLang) ? defaultLang : this.translocoService.getDefaultLang();
    console.log(`setActiveLang: ${activeLang}`);
    this.translocoService.setActiveLang(activeLang);
  }

  private setupSession(): void {
    console.log('setupSession');

    this.sessionService.initSession().subscribe({
      next: (session: SessionData) => {
        console.log('session.user=' + session.user?.loginName);
        this.goToDefaultPage();
      },
      error: (err) => {
        console.log('session.user is not authenticated yet');
      }
    });
  }

  private goToDefaultPage(): void {
    if (this.sessionService.isUserInRole('ROLE_ADMIN')) {
      this.router.navigate([RouterUrls.HOME_PAGE]);
    } else if (this.sessionService.isUserInRole('ROLE_USER')) {
      this.router.navigate([RouterUrls.HOME_PAGE]);
    }
  }
}
