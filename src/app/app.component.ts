import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getBrowserLang, Translation, TranslocoService } from '@ngneat/transloco';
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
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      this.setupSession();
    });
  }

  title = 'jworldcup-ui-an';

  private setupSession(): void {
    this.sessionService.initSession().subscribe({
      next: (session: SessionData) => {
        console.log('session.user=' + session.user?.loginName);
        this.goToDefaultPage();
      },
      error: (err) => {
        console.log('not authenticated yet');
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
