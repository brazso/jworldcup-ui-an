import { Component, OnDestroy, OnInit } from '@angular/core';
import { GenericListResponse, Group, GroupTeam, SessionData, Team } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { distinctArrayByPropertyName } from 'src/app/shared/utils';
import { Subscription } from 'rxjs';

@Component({
  // selector: 'app-group-standings',
  templateUrl: './group-standings.component.html',
  styleUrls: ['./group-standings.component.scss']
})
export class GroupStandingsComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  session: SessionData;
  groupTeams: GroupTeam[];
  groups: Group[];

  constructor(
    private readonly sessionService: SessionService,
    private readonly apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.subscription.add(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`favourite-team.component/ngOnInit/session: ${JSON.stringify(session)}`);

        this.apiService.get<GenericListResponse<GroupTeam>>(ApiEndpoints.GROUPS.GROUP_TEAMS_BY_EVENT+`?eventId=${this.session.event?.eventId}`).subscribe(
          (response) => {
            this.groupTeams = response.data;
            console.log(`favourite-team.component/ngOnInit/groupTeams: ${JSON.stringify(this.groupTeams)}`);

            // retrieve groups from loaded groupTeams
            this.groups = distinctArrayByPropertyName<Group>(this.groupTeams.map(e => e.team?.group as Group), 'groupId').sort((a, b) => a.groupId! - b.groupId!);
            console.log(`favourite-team.component/ngOnInit/groups: ${JSON.stringify(this.groups)}`);
          }
        );
      }
    ));
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  filterGroupTeamsByGroup(group: Group): GroupTeam[] {
    return this.groupTeams.filter(e => e.team?.group?.groupId === group.groupId);
  }

}
