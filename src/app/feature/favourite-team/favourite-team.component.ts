import { Component, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ApiService, SessionService } from 'src/app/core/services';
import { GenericListResponse, SessionData, Team, UiError } from 'src/app/core/models';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { forkJoin } from 'rxjs';

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
  }

  doSave(event_: any): void {
    console.log(`selectedGroupTeam: ${JSON.stringify(this.selectedGroupTeam)}`);
    console.log(`selectedKnockOutTeam: ${JSON.stringify(this.selectedKnockOutTeam)}`);
  }

  doCancel(event_: any): void {
    this.sessionService.goToDefaultPage();
  }
}
