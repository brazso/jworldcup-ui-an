import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { mergeMap, Observable, of, Subscription } from 'rxjs';
import { ApiService, Bet, GenericListResponse, Match, SessionData, SessionService, UserGroup } from 'src/app/core';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';

@Component({
  // no selector here because it is a primeNG dynamic dialog
  templateUrl: './other-bets.component.html',
  styleUrls: ['./other-bets.component.scss']
})
export class OtherBetsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  session: SessionData;
  userGroups: UserGroup[];
  selectedUserGroup: UserGroup | null;
  otherBets: Bet[];
  selectedOtherBet: Bet | null;
  match: Match;

  constructor(
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig,
    private translocoService: TranslocoService,
    private apiService: ApiService,
    private sessionService: SessionService    
  ) { }

  ngOnInit(): void {
    console.log(`other-bets.component/ngOnInit/config.data: ${JSON.stringify(this.config.data)}`);
    this.match = this.config.data.match;

    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`other-bets.component/ngOnInit/session: ${JSON.stringify(session)}`);

        this.apiService.get<GenericListResponse<UserGroup>>(`${ApiEndpoints.USER_GROUPS.USER_GROUPS_BY_EVENT_AND_USER}?eventId=${this.sessionService.getEvent().eventId}&userId=${this.sessionService.getUser().userId}&isEverybodyIncluded=false`)
        .pipe(mergeMap((value) => {
          this.userGroups = value.data;
          console.log(`other-bets.component/ngOnInit/userGroups: ${JSON.stringify(this.userGroups)}`);
          this.selectedUserGroup  = this.userGroups.length > 0 ? this.userGroups[0] : null;
          return this.retrieveOtherBets();
        }))
        .subscribe(
          (value) => {
            this.otherBets = value.data;
            console.log(`other-bets.component/ngOnInit/otherBets: ${JSON.stringify(this.otherBets)}`);
            this.selectedOtherBet = this.otherBets.find(e => e.user?.userId === this.sessionService.getUser().userId) || null;
          } 
        );
      }
    ));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onUserGroupChange(event_: any): void {
    console.log(`other-bets.component/onUserGroupChange: event_: ${JSON.stringify(event_)}`);
    this.selectedUserGroup = event_.value;
    this.retrieveOtherBets().subscribe(
      (value) => {
        this.otherBets = value.data;
        console.log(`other-bets.component/onUserGroupChange/otherBets: ${JSON.stringify(this.otherBets)}`);
      } 
    );
  }

  onRowSelect(event_: any): void {
    console.log(`other-bets.component/onRowSelect data: ${JSON.stringify(event_.data)}`);
  }

  onRowUnselect(event_: any): void {
    console.log(`other-bets.component/onRowUnselect`);
  }

  retrieveOtherBets(): Observable<GenericListResponse<Bet>> {
    if (this.selectedUserGroup) {
      return this.apiService.get<GenericListResponse<Bet>>(`${ApiEndpoints.BETS.BETS_BY_MATCH_AND_USER_GROUP}?matchId=${this.match.matchId}&userGroupId=${this.selectedUserGroup?.userGroupId}`);
    }
    else {
      return of();
    }
  }
}
