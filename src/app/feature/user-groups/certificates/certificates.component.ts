import { Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { ApiService, SessionService } from 'src/app/core';
import { GenericListResponse, GenericResponse, SessionData, UserCertificate, UserCertificateExtended } from 'src/app/core/models';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { HttpErrorResponse } from '@angular/common/http';
import printJS from 'print-js';

@Component({
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  session: SessionData;
  score: number = 0;
	userCertificates: UserCertificate[] = [];
  selectedUserCertificate: UserCertificate | undefined;
  isPrintCertificatedDialogDisplayed: boolean = false;

  constructor(
    public sessionService: SessionService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);

        forkJoin([
          this.apiService.get<GenericResponse<number>>(`${ApiEndpoints.BETS.FIND_SCORE_BY_EVENT_AND_USER}?eventId=${this.sessionService.getEvent().eventId}&userId=${this.sessionService.getUser().userId}`),
          this.apiService.get<GenericListResponse<UserCertificate>>(`${ApiEndpoints.USER_GROUPS.FIND_USER_CERTIFICATES_BY_EVENT_AND_USER}?eventId=${this.sessionService.getEvent().eventId}&userId=${this.sessionService.getUser().userId}`),
          ]).subscribe(([scoreResponse, userCertificatesResponse]) => {
            this.score = scoreResponse.data;
            this.userCertificates = userCertificatesResponse.data;
            console.log(`score: ${this.score}, userCertificates: ${JSON.stringify(this.userCertificates)}`);
          }
        );
      }
    ));    
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onRowSelect(event_: any): void {
    console.log(`onRowSelect data: ${JSON.stringify(event_.data)}`);
  }

  onRowUnselect(event_: any): void {
    console.log(`onRowUnselect`);
  }

  printCertificate(userCertificate: UserCertificate): void {
    console.log(`printCertificate`);
    let userCerrtificateExtended: UserCertificateExtended = userCertificate;
    userCerrtificateExtended.languageTag = this.session.localeId;
    console.log(`userCerrtificateExtended: ${JSON.stringify(userCerrtificateExtended)}`);

    this.apiService.post<any>(ApiEndpoints.USER_GROUPS.PRINT_USER_CERTIFICATE, userCerrtificateExtended, {responseType: 'blob' })
    .subscribe({
      next: value => {
        const tempBlob = new Blob([value], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(tempBlob);
        // window.open(blobURL, '_blank');
        printJS({
          printable: blobUrl,
          type: 'pdf',
          onLoadingStart: () => this.onLoadingStart(),
          onLoadingEnd: () => this.onLoadingEnd()
        });
      },
      error: (err: HttpErrorResponse) => {
        console.log(`err: ${JSON.stringify(err)}`);
      },
      complete: () => {
        console.log('complete');
      }
    });
  }

  onLoadingStart(): void {
    this.isPrintCertificatedDialogDisplayed = true;
  }

  onLoadingEnd(): void {
    this.isPrintCertificatedDialogDisplayed = false;
  }

}
