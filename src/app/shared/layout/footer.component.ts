import { Component, OnDestroy, OnInit } from '@angular/core';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { BackendService, SessionService } from 'src/app/core/services';
import pkg from 'package.json';
import { GenericResponse, SessionData } from 'src/app/core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  today: number = Date.now();
  frontendVersion: string;
  backendVersion: string;
  session: SessionData = {};

  constructor(
    private translocoService: TranslocoService,
    private backendService: BackendService,
    private sessionService: SessionService
    ) {
  }

  ngOnInit(): void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe(
      (translation: Translation) => {
        this.setupFrontendBackendVersions();
      }
    );

    this.subscription.add(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`footer.component/ngOnInit/session: ${JSON.stringify(session)}`);
      }
    ));
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  private setupFrontendBackendVersions(): void {
    this.frontendVersion = "{0} ({1})".format(pkg.version, pkg.versionDate);
    this.backendService.getBackendVersion().subscribe(
      (value: GenericResponse<string>) => {
        this.backendVersion = value.data as string;
      }
    );
  }
}
