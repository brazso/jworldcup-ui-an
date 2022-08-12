import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService, SessionService } from 'src/app/core/services';
import { GenericListResponse, GenericResponse, SessionData, Team, UiError, UserOfEvent } from 'src/app/core/models';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { forkJoin, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  // selector: 'app-favourite-team',
  templateUrl: './favourite-team.component.html',
  styleUrls: ['./favourite-team.component.scss']
})
export class FavouriteTeamComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  isSubmitting = false;
  errors: UiError = new UiError({});
  session: SessionData;
  groupTeams: Team[];
  selectedGroupTeam: Team | null;
  knockOutTeams: Team[];
  selectedKnockOutTeam: Team | null;
  
  constructor(
    // private readonly router: Router,
    // private readonly translocoService: TranslocoService,
    private readonly sessionService: SessionService,
    private readonly apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`favourite-team.component/session: ${JSON.stringify(session)}`);

        this.selectedGroupTeam = session.userOfEvent?.favouriteGroupTeam ?? null;
        this.selectedKnockOutTeam = session.userOfEvent?.favouriteKnockoutTeam ?? null;

        forkJoin([
          this.apiService.get<GenericListResponse<Team>>(`${ApiEndpoints.TEAMS.FIND_FAVOURITE_GROUP_TEAMS_BY_EVENT}?eventId=${session.event?.eventId}`),
          this.apiService.get<GenericListResponse<Team>>(`${ApiEndpoints.TEAMS.FIND_FAVOURITE_KNOCK_OUT_TEAMS_BY_EVENT}?eventId=${session.event?.eventId}`)
          ]).subscribe(([groupTeamsResponse, knockOutTeamsResponse]) => {
            this.groupTeams = groupTeamsResponse.data;
            this.knockOutTeams = knockOutTeamsResponse.data;
          }
        );
      }
    ));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  isGroupTeamSelectItemListDisabled(): boolean {
		return this.session.actualDateTime! > this.session.event?.startTime!;
	}

  isKnockoutTeamSelectItemListDisabled(): boolean {
		return this.session.actualDateTime! > this.session.event?.knockoutStartTime!;
	}

  isSaveDisabled(): boolean {
    return this.isGroupTeamSelectItemListDisabled() || this.isKnockoutTeamSelectItemListDisabled();
  }

  doSave(event_: any): void {
    console.log(`favourite-team.component/selectedGroupTeam: ${JSON.stringify(this.selectedGroupTeam)}`);
    console.log(`favourite-team.component/selectedKnockOutTeam: ${JSON.stringify(this.selectedKnockOutTeam)}`);
    this.submitForm();
  }

  doCancel(event_: any): void {
    this.sessionService.goToDefaultPage();
  }

  submitForm() {
    this.isSubmitting = true;
    this.errors = new UiError({});

    let url = `${ApiEndpoints.USERS.SAVE_USER_OF_EVENT}?userId=${this.session.user?.userId}&eventId=${this.session.event?.eventId}`;
    if (this.selectedGroupTeam?.teamId) {
      url += `&favouriteGroupTeamId=${this.selectedGroupTeam?.teamId}`;
    }
    if (this.selectedKnockOutTeam?.teamId) {
      url += `&favouriteKnockoutTeamId=${this.selectedKnockOutTeam?.teamId}`;
    }
    this.apiService.post<GenericResponse<UserOfEvent>>(url).subscribe({
      next: value => {
        console.log('favourite-team.component/saved');
        this.session.userOfEvent = value.data;
        this.isSubmitting = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`favourite-team.component/err: ${JSON.stringify(err)}`);
        this.errors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('favourite-team.component/complete');
      }
    });
  }
}
