import { Component, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ApiService, SessionService } from 'src/app/core/services';
import { Event, GenericListResponse, GenericResponse, SessionData, Team, UiError, UserOfEvent } from 'src/app/core/models';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  // selector: 'app-favourite-team',
  templateUrl: './favourite-team.component.html',
  styleUrls: ['./favourite-team.component.scss']
})
export class FavouriteTeamComponent implements OnInit {

  isSubmitting = false;
  errors: UiError = new UiError({});
  session: SessionData;
  groupTeams: Team[];
  selectedGroupTeam: Team | null;
  knockOutTeams: Team[];
  selectedKnockOutTeam: Team | null;
  event: Event;
  
  constructor(
    // private readonly router: Router,
    // private readonly translocoService: TranslocoService,
    private readonly sessionService: SessionService,
    private readonly apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);

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
    );

    this.sessionService.event.subscribe(
      (event: Event) => {
        this.event = event;
        console.log(`event: ${JSON.stringify(event)}`);
      }
    );
  }

  isGroupTeamSelectItemListDisabled(): boolean {
		return this.sessionService.getSession().actualDateTime! > this.event.startTime!;
	}

  isKnockoutTeamSelectItemListDisabled(): boolean {
		return this.sessionService.getSession().actualDateTime! > this.event.knockoutStartTime!;
	}

  doSave(event_: any): void {
    console.log(`selectedGroupTeam: ${JSON.stringify(this.selectedGroupTeam)}`);
    console.log(`selectedKnockOutTeam: ${JSON.stringify(this.selectedKnockOutTeam)}`);
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
        console.log('saved');
        this.session.userOfEvent = value.data;
        this.sessionService.setSession(this.session);
        this.isSubmitting = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`err: ${JSON.stringify(err)}`);
        this.errors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('complete');
      }
    });
  }
}
