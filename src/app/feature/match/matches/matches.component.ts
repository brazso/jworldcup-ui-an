import { Component, OnInit } from '@angular/core';
import { Event, GenericListResponse, getShortDescWithYearByEvent, Match, Round, SessionData } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { distinctArrayByPropertyName } from 'src/app/shared/utils';
import { Translation, TranslocoService } from '@ngneat/transloco';
import equal from 'fast-deep-equal';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent implements OnInit {
  title: string;
  event: Event = {};
  matches: Match[] = [];
  rounds: Round[] = [];
  eventTriggerStartTimes: Date[] = [];

  constructor(
    private apiService: ApiService,
    public sessionService: SessionService,
    private translocoService: TranslocoService
  ) { }

  ngOnInit(): void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      // Set a title for the page accordingly
      this.title = this.translocoService.translate(this.sessionService.isUserAdmin() ? 'ENTER_MATCH_RESULTS' : 'VIEW_MATCH_RESULTS');
    });

    this.sessionService.event.subscribe(
      (event: Event) => {
        this.event = event;
        console.log(`event: ${JSON.stringify(event)}`);

        // this.apiService.get<GenericListResponse<Round>>(ApiEndpoints.MATCHES.RETRIEVE_ROUNDS_BY_EVENT_ID).subscribe(
        //   (value: GenericListResponse<Round>) => {
        //     this.rounds = value.data;
        //   }
        // );

        this.apiService.get<GenericListResponse<Match>>(`${ApiEndpoints.MATCHES.MATCHES_BY_EVENT}?eventByShortDescWithYear=${getShortDescWithYearByEvent(this.event)}`).subscribe(
          (value: GenericListResponse<Match>) => {
            this.matches = value.data;

            // retrieve rounds from loaded matches
            this.rounds = distinctArrayByPropertyName<Round>(this.matches.map(e => e.round as Round), 'roundId').sort((a, b) => a.roundId! - b.roundId!);
            console.log(`rounds: ${JSON.stringify(this.rounds)}`)
          }
        );
      }
    );

    this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.eventTriggerStartTimes = session.eventTriggerStartTimes ?? [];
      }
    );
  }

  filterMatchesByRound(round: Round): Match[] {
    // return this.matches.filter(e => equal(e.round, round));
    return this.matches.filter(e => e.round!.roundId === round.roundId);
  }
}
