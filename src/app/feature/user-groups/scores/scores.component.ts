import { Component, OnDestroy, OnInit } from '@angular/core';
import { GenericListResponse, GenericResponse, LineChartData, SessionData, SessionDataModificationFlag, UserGroup, UserPosition } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { mergeMap, Observable, of, Subscription } from 'rxjs';
import { TranslocoExDatePipe } from 'src/app/shared';
import { Translation, TranslocoService } from '@ngneat/transloco';

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
  chartData: any;
  chartOptions: any;

  constructor(
    public readonly sessionService: SessionService,
    private readonly apiService: ApiService,
    private translocoDatePipe: TranslocoExDatePipe,
    private translocoService: TranslocoService
  ) { }

  ngOnInit(): void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
        this.chartOptions = {
          plugins: {
              title: {
                  display: true,
                  text: this.translocoService.translate('scores.chart.title')
              }
          }
        }
      });

    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        let selectedUserGroup: UserGroup | undefined;
        console.log(`scores.component/ngOnInit/session: ${JSON.stringify(session)}`);
        if (!this.userGroups || (session.modificationSet ?? []).includes(SessionDataModificationFlag.EVENT)) {
          this.apiService.get<GenericListResponse<UserGroup>>(`${ApiEndpoints.USER_GROUPS.USER_GROUPS_BY_EVENT_AND_USER}?eventId=${this.sessionService.getEvent().eventId}&userId=${this.sessionService.getUser().userId}&isEverybodyIncluded=true`)
          .pipe(mergeMap((value) => {
            this.userGroups = value.data;
            console.log(`scores.component/ngOnInit/userGroups: ${JSON.stringify(this.userGroups)}`);
            this.selectedUserGroup = this.userGroups.length > 0 ? this.userGroups[0] : undefined;
            console.log(`scores.component/ngOnInit/selectedUserGroup: ${JSON.stringify(this.selectedUserGroup)}`);
            selectedUserGroup = this.selectedUserGroup; // extra backup because this.selectedUserGroup might be lost later somehow
            console.log(`scores.component/ngOnInit/selectedUserGroupX: ${JSON.stringify(selectedUserGroup)}`);
            return this.retrieveUserPositions();
          }))
          .subscribe(
            (value) => {
              console.log(`scores.component/ngOnInit/selectedUserGroup2: ${JSON.stringify(this.selectedUserGroup)}`); // might be undefined somehow
              console.log(`scores.component/ngOnInit/selectedUserGroupX2: ${JSON.stringify(selectedUserGroup)}`);
              if (!this.selectedUserGroup) {
                this.selectedUserGroup = selectedUserGroup;
              }
              this.userPositions = value.data;
              console.log(`scores.component/ngOnInit/userPositions: ${JSON.stringify(this.userPositions)}`);
              this.createScoresLineModel();
            } 
          );
        }
      }
    ));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onUserGroupChange(event_: any): void {
    console.log(`scores.component/onUserGroupChange: event_: ${JSON.stringify(event_)}`);
    this.selectedUserGroup = event_.value;
    this.retrieveUserPositions().subscribe(
      (value) => {
        this.userPositions = value.data;
        console.log(`scores.component/onUserGroupChange/userPositions: ${JSON.stringify(this.userPositions)}`);
        this.createScoresLineModel();
      } 
    );
  }

  onRowSelect(event_: any): void {
    console.log(`scores.component/onRowSelect data: ${JSON.stringify(event_.data)}`);
  }

  onRowUnselect(event_: any): void {
    console.log(`scores.component/onRowUnselect`);
  }

  retrieveUserPositions(): Observable<GenericListResponse<UserPosition>> {
    console.log(`scores.component/retrieveUserPositions/selectedUserGroup: ${JSON.stringify(this.selectedUserGroup)}`);
    if (this.selectedUserGroup) {
      return this.apiService.get<GenericListResponse<UserPosition>>(`${ApiEndpoints.USER_GROUPS.USER_POSITIONS_BY_EVENT_AND_USER_GROUP}?eventId=${this.sessionService.getEvent().eventId}&userGroupId=${this.selectedUserGroup?.userGroupId}`);
    }
    else {
      return of();
    }
  }

  private createScoresLineModel(): void {
    let matchDates: string[];

    console.log(`scores.component/createScoresLineModel/selectedUserGroup: ${JSON.stringify(this.selectedUserGroup)}`);
    this.apiService.get<GenericResponse<LineChartData>>(`${ApiEndpoints.USER_GROUPS.FIND_LINE_CHART_DATA_BY_EVENT_AND_USER_GROUP}?eventId=${this.sessionService.getEvent().eventId}&userGroupId=${this.selectedUserGroup?.userGroupId}`)
    .subscribe((value) => {
      this.chartData = value.data;
      this.chartData.labels = value.data.matchDates!.map(e => this.translocoDatePipe.transform(e));
      value.data.datasets?.forEach((e) => { e.borderColor = this.getRandomRgb()});
      delete this.chartData.matchDates;
      console.log(`scores.component/createScoresLineModel/data: ${JSON.stringify(this.chartData)}`);
    });
  }

  private getRandomRgb(): string {
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = num >> 8 & 255;
    var b = num & 255;
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}
