import { Component, OnInit } from '@angular/core';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { GenericMapResponse, SessionData, UiError, User } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoService } from '@ngneat/transloco';
import { ReplaceLineBreaksPipe } from 'src/app/shared/pipes/replace-line-breaks.pipe';

@Component({
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  isSubmitting = false;
  errors: UiError = new UiError({});
  session: SessionData;
  zoneIds: SelectItem<string>[];
  user: User; // edited object, it is a shallow copy of session.user

  constructor(
    private readonly sessionService: SessionService,
    private readonly apiService: ApiService,
    private confirmationService: ConfirmationService,
    private translocoService: TranslocoService,
    private replaceLineBreaksPipe: ReplaceLineBreaksPipe
  ) { }

  ngOnInit(): void {
    this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);

        this.user = {...session.user!}; // shallow copy is enough for user object

        // this.selectedGroupTeam = session.userOfEvent?.favouriteGroupTeam ?? null;
        // this.selectedKnockOutTeam = session.userOfEvent?.favouriteKnockoutTeam ?? null;

        // forkJoin([
        //   this.apiService.get<GenericListResponse<Team>>(`${ApiEndpoints.TEAMS.FIND_FAVOURITE_GROUP_TEAMS_BY_EVENT}?eventId=${session.event?.eventId}`),
        //   this.apiService.get<GenericListResponse<Team>>(`${ApiEndpoints.TEAMS.FIND_FAVOURITE_KNOCK_OUT_TEAMS_BY_EVENT}?eventId=${session.event?.eventId}`)
        //   ]).subscribe(([groupTeamsResponse, knockOutTeamsResponse]) => {
        //     this.groupTeams = groupTeamsResponse.data;
        //     this.knockOutTeams = knockOutTeamsResponse.data;
        //   }
        // );

        this.apiService.get<GenericMapResponse<string>>(ApiEndpoints.USERS.FIND_TIME_ZONE_IDS).subscribe(
          (value) => {
            this.zoneIds = Object.entries(value.data).map(e => ({label: e[0]+" ("+e[1]+")", value: e[0]}) as SelectItem<string>)
            // console.log(`zoneIds: ${JSON.stringify(this.zoneIds)}`);
          }
        );
      }
    );
  }

  doDelete(event_: any): void {
    // console.log(`selectedGroupTeam: ${JSON.stringify(this.selectedGroupTeam)}`);
    this.confirmationService.confirm({
      message: this.replaceLineBreaksPipe.transform(this.translocoService.translate('userDetail.popup.confirm.deleteUser')),
      accept: () => {
        console.log('Delete');
        //Actual logic to perform a confirmation
      }
  });
  }

  doSave(event_: any): void {
    // console.log(`selectedGroupTeam: ${JSON.stringify(this.selectedGroupTeam)}`);
    this.submitForm();
  }

  doCancel(event_: any): void {
    console.log(`cancel user: ${JSON.stringify(this.user)}, session.user: ${JSON.stringify(this.session.user)}`);
    this.sessionService.goToDefaultPage();
  }

  submitForm() {
    this.isSubmitting = true;
    this.errors = new UiError({});

    // let url = `${ApiEndpoints.USERS.SAVE_USER_OF_EVENT}?userId=${this.session.user?.userId}&eventId=${this.session.event?.eventId}`;
    // if (this.selectedGroupTeam?.teamId) {
    //   url += `&favouriteGroupTeamId=${this.selectedGroupTeam?.teamId}`;
    // }
    // if (this.selectedKnockOutTeam?.teamId) {
    //   url += `&favouriteKnockoutTeamId=${this.selectedKnockOutTeam?.teamId}`;
    // }
    // this.apiService.post<GenericResponse<UserOfEvent>>(url).subscribe({
    //   next: value => {
    //     console.log('saved');
    //     this.session.userOfEvent = value.data;
    //     // this.sessionService.setSession(this.session);
    //     this.isSubmitting = false;
    //   },
    //   error: (err: HttpErrorResponse) => {
    //     console.log(`err: ${JSON.stringify(err)}`);
    //     this.errors = new UiError(Object.assign(err));
    //     this.isSubmitting = false;
    //   },
    //   complete: () => {
    //     console.log('complete');
    //   }
    // });
  }
}
