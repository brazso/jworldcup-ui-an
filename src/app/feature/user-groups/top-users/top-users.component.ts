import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService, SessionService } from 'src/app/core';
import { GenericListResponse, SessionData, UserCertificate } from 'src/app/core/models';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  templateUrl: './top-users.component.html',
  styleUrls: ['./top-users.component.scss']
})
export class TopUsersComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  session: SessionData;
	userCertificates: UserCertificate[] = [];
  selectedUserCertificate: UserCertificate | undefined;
  // isPrintCertificatedDialogDisplayed: boolean = false;

  constructor(
    public sessionService: SessionService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);

        this.apiService.get<GenericListResponse<UserCertificate>>(`${ApiEndpoints.APPLICATION.RETRIEVE_TOP_USERS}`).subscribe((value) => {
          this.userCertificates = value.data;
          console.log(`userCertificates: ${JSON.stringify(this.userCertificates)}`);
        });
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

}
