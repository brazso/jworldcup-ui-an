import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GenericListResponse, SessionData, UserGroup, UserPosition } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { mergeMap, Observable, of, Subscription } from 'rxjs';
import { UIChart } from 'primeng/chart';

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
  selectedUserPosition: UserPosition | undefined;
  data: any;
  @ViewChild("chart") chart: UIChart; 

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
          this.selectedUserGroup = this.userGroups.length > 0 ? this.userGroups[0] : undefined;
          return this.retrieveUserPositions();
        }))
        .subscribe(
          (value) => {
            this.userPositions = value.data;
            console.log(`userPositions: ${JSON.stringify(this.userPositions)}`);
            this.createScoresLineModel();
          } 
        );
      }
    ));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onUserGroupChange(event_: any): void {
    console.log(`onUserGroupChange: event_: ${JSON.stringify(event_)}`);
    this.selectedUserGroup = event_.value;
    this.retrieveUserPositions().subscribe(
      (value) => {
        this.userPositions = value.data;
        console.log(`userPositions: ${JSON.stringify(this.userPositions)}`);
        this.createScoresLineModel();
      } 
    );
  }

  onRowSelect(event_: any): void {
    console.log(`onRowSelect data: ${JSON.stringify(event_.data)}`);
  }

  onRowUnselect(event_: any): void {
    console.log(`onRowUnselect`);
  }

  retrieveUserPositions(): Observable<GenericListResponse<UserPosition>> {
    if (this.selectedUserGroup) {
      return this.apiService.get<GenericListResponse<UserPosition>>(`${ApiEndpoints.USER_GROUPS.USER_POSITIONS_BY_EVENT_AND_USER_GROUP}?eventId=${this.sessionService.getEvent().eventId}&userGroupId=${this.selectedUserGroup?.userGroupId}`);
    }
    else {
      return of();
    }
  }

  private createScoresLineModel(): void {
    // let matchDates: string[];
    // this.apiService.get<GenericListResponse<string>>(`${ApiEndpoints.MATCHES.MATCH_START_DATES_BY_EVENT}?eventId=${this.sessionService.getEvent().eventId}`)
    // .subscribe((value) => {
    //   matchDates = value.data; // ["2021-06-13T00:00:00Z","2021-06-14T00:00:00Z",...,"2021-07-11T00:00:00Z"]
    //   this.data = {};
    //   this.data.labels = matchDates;
    //   this.data.datasets = [];
    //   console.log(`matchDates: ${JSON.stringify(matchDates)}`);
    //   for (const userPosition of this.userPositions) {
    //     if (userPosition.loginName === 'brazso') {
    //     let dataset = { label: userPosition.loginName, data: [] as number[]};
    //     this.data.datasets.push(dataset);
    //     this.apiService.get<GenericMapResponse<number>>(`${ApiEndpoints.BETS.DATE_SCORE_MAP_BY_EVENT_AND_USER}?eventId=${this.sessionService.getEvent().eventId}&userId=${userPosition.userId}`)
    //     .subscribe((value) => {
    //       let mapScoreByDate = value.data; // {"2021-06-29T00:00":40,"2021-06-27T00:00":35,...,"2021-07-02T00:00":40}
    //       console.log(`mapScoreByDate1: ${JSON.stringify(mapScoreByDate)}`);
    //       Object.keys(mapScoreByDate).forEach(e => {
    //         mapScoreByDate[e+':00Z'] = mapScoreByDate[e];
    //         delete mapScoreByDate[e];
    //       });
    //       console.log(`mapScoreByDate2: ${JSON.stringify(mapScoreByDate)}`);
    //       for (const matchDate of matchDates) {
    //         if (Object.keys(mapScoreByDate).includes(matchDate)) {
    //           // this.data.datasets[this.data.datasets.length-1].data.push(mapScoreByDate[matchDate]);
    //           dataset.data.push(mapScoreByDate[matchDate]);
    //           console.log(`data: ${JSON.stringify(this.data)}`);
    //         }
    //       }
    //     });
    //   }}
    // });

    // this.data = {
    //   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //   datasets: [
    //       {
    //           label: 'First Dataset',
    //           data: [65, 59, 80, 81, 56, 55, 40]
    //       },
    //       {
    //           label: 'Second Dataset',
    //           data: [28, 48, 40, 19, 86, 27, 90]
    //       }
    //   ]
    // }
  }
}
