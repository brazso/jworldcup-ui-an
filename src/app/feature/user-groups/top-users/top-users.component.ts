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

  private subscription: Subscription = new Subscription();
  session: SessionData;
	userCertificates: UserCertificate[] = [];
  selectedUserCertificate: UserCertificate | null;

  constructor(
    public sessionService: SessionService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.subscription.add(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`top-users.component/ngOnInit/session: ${JSON.stringify(session)}`);

        this.apiService.get<GenericListResponse<UserCertificate>>(`${ApiEndpoints.APPLICATION.RETRIEVE_TOP_USERS}`).subscribe((value) => {
          this.userCertificates = value.data;
          console.log(`top-users.component/ngOnInit/userCertificates: ${JSON.stringify(this.userCertificates)}`);
        });
      }
    ));    
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onRowSelect(event_: any): void {
    console.log(`top-users.component/onRowSelect data: ${JSON.stringify(event_.data)}`);
  }

  onRowUnselect(event_: any): void {
    console.log(`top-users.component/onRowUnselect`);
  }

}
