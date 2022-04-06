import { Component, OnDestroy, OnInit } from '@angular/core';
import { GenericListResponse, SessionData, UserGroup, UserPosition } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { empty, flatMap, map, merge, mergeMap, of, Subscription, tap } from 'rxjs';

@Component({
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.scss']
})
export class ScoresComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  session: SessionData;
  userGroups: UserGroup[];
  selectedUserGroup: UserGroup | undefined;
  userPositions: UserPosition[];

  constructor(
    public readonly sessionService: SessionService,
    private readonly apiService: ApiService
    // private translocoService: TranslocoService,
    // private replaceLineBreaksPipe: ReplaceLineBreaksPipe
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);

        this.apiService.get<GenericListResponse<UserGroup>>(`${ApiEndpoints.USER_GROUPS.USER_GROUPS_BY_EVENT_AND_USER}?eventId=${this.sessionService.getEvent().eventId}&userId=${this.sessionService.getUser().userId}&isEverybodyIncluded=true`)
        .pipe(mergeMap((value) => {
          this.userGroups = value.data;
          console.log(`userGroups: ${JSON.stringify(this.userGroups)}`);
          if (this.userGroups.length > 0) {
            this.selectedUserGroup = this.userGroups[0];
            return this.apiService.get<GenericListResponse<UserPosition>>(`${ApiEndpoints.USER_GROUPS.USER_POSITIONS_BY_EVENT_AND_USER_GROUP}?eventId=${this.sessionService.getEvent().eventId}&userGroupId=${this.selectedUserGroup?.userGroupId}`);
          }
          else {
            this.selectedUserGroup = undefined;
            return of();
          }
        }))
        .subscribe(
          (value) => {
            this.userPositions = value.data;
            console.log(`userPositions: ${JSON.stringify(this.userPositions)}`);
          } 
        );
      }
    ));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onUserGroupChange(event_: any): void {
    console.log('onUserGroupChange');
    // const event: Event = event_.value;
    
    // this.sessionService.getSession().event = this.event;

    // eventCompletionPercent must be refreshed
    // this.sessionService.initSession().subscribe();
  }
}
