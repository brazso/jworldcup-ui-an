import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SessionData } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';

@Component({
  // selector: 'app-group-standings',
  templateUrl: './group-standings.component.html',
  styleUrls: ['./group-standings.component.scss']
})
export class GroupStandingsComponent implements OnInit {
  session: SessionData;

  constructor(
    private readonly sessionService: SessionService,
    private readonly apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);

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
      }
    );
  }

}
