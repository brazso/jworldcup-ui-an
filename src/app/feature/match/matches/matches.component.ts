import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, GenericListResponse, GenericResponse, getShortDescWithYearByEvent, Match, Round, SessionData } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { distinctArrayByPropertyName } from 'src/app/shared/utils';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { MatchComponent } from '../match.component';
import { HttpErrorResponse } from '@angular/common/http';
import { isArrayEmpty } from 'src/app/shared/utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  title: string;
  event: Event = {};
  matches: Match[] = [];
  rounds: Round[] = [];
  eventTriggerStartTimes: Date[] = [];
  selectedMatch: Match;
  cmItems: MenuItem[]; // contextMenu
  selectedEventTriggerStartTime: Date;

  constructor(
    private apiService: ApiService,
    public sessionService: SessionService, // it is public because there is reference to sessionService from html
    private translocoService: TranslocoService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      // Set a title for the page accordingly
      this.title = this.translocoService.translate(this.sessionService.isUserAdmin() ? 'ENTER_MATCH_RESULTS' : 'VIEW_MATCH_RESULTS');

      this.cmItems = [
        {label: this.translocoService.translate('general.button.edit'), icon: 'pi pi-fw pi-pencil', command: () => this.editMatch(this.selectedMatch)},
        {label: this.translocoService.translate('general.button.reset'), icon: 'pi pi-fw pi-times', command: () => this.resetMatch(this.selectedMatch)}
      ];
    });

    this.subscriptions.push(this.sessionService.event.subscribe(
      (event: Event) => {
        this.event = event;
        console.log(`event: ${JSON.stringify(event)}`);

        this.apiService.get<GenericListResponse<Match>>(`${ApiEndpoints.MATCHES.MATCHES_BY_EVENT}?eventByShortDescWithYear=${getShortDescWithYearByEvent(this.event)}`).subscribe(
          (value: GenericListResponse<Match>) => {
            this.matches = value.data;

            // retrieve rounds from loaded matches
            this.rounds = distinctArrayByPropertyName<Round>(this.matches.map(e => e.round as Round), 'roundId').sort((a, b) => a.roundId! - b.roundId!);
            console.log(`rounds: ${JSON.stringify(this.rounds)}`);
          }
        );
      }
    ));

    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.eventTriggerStartTimes = session.eventTriggerStartTimes ?? [];
      }
    ));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  filterMatchesByRound(round: Round): Match[] {
    // return this.matches.filter(e => equal(e.round, round));
    return this.matches.filter(e => e.round!.roundId === round.roundId);
  }

  /**
   * 
   * @param match returns a css style class calculated from the result of the given match by the given team side [1, 2]
   * @param side 
   */
  getMatchStyleClass(match: Match, side: number): string {
    let styleClass = '';

    if (match.resultSignByTeam1 == null) {
      return styleClass;
    }

    const resultSignByTeamSide: number = match.resultSignByTeam1 * (side === 2 ? -1 : 1);
    if (resultSignByTeamSide === 1) {
			styleClass += "bold ";
		}
		if (!match.round?.isGroupmatch && resultSignByTeamSide === -1) {
			styleClass += "overstriked ";
		}
    
    return styleClass;
  }

  editMatch(match: Match) {
    console.log('editMatch');

    const ref = this.dialogService.open(MatchComponent, {
      data: {
        matchId: match.matchId
      },
      header: this.translocoService.translate('matchDetail.title'),
      // closable: false,
      // showHeader: false, // header and closeable are ignored
      // width: '70%'
    });

    ref.onClose.subscribe((match: Match) => {
      console.log(`onClose match: ${JSON.stringify(match)}`);
      if (match) {
        // replace selectedMatch inside matches to the incoming match
        const index = this.matches.findIndex(e => e.matchId === match.matchId);
        if (index !== -1) {
          this.matches[index] = match;
          this.selectedMatch = match;
        }
      }
    });
  }

  resetMatch(match: Match) {
    console.log('resetMatch');
    // this.messageService.add({severity: 'info', summary: 'Product Selected', detail: product.name });

    this.apiService.put<GenericResponse<Match>>(ApiEndpoints.MATCHES.RESET_MATCH.format(match.matchId)).subscribe({
      next: value => {
        const match = value.data;
        // replace selectedMatch inside matches to the incoming match
        const index = this.matches.findIndex(e => e.matchId === match.matchId);
        if (index !== -1) {
          this.matches[index] = match;
          this.selectedMatch = match;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(`err: ${JSON.stringify(err)}`);
        // this.errors = new UiError(Object.assign(err));
      },
      complete: () => {
        console.log('complete');
      }
    });
  }

  isMatchEditable(match: Match): boolean {
    return this.sessionService.isUserAdmin() && (!!match.team1 && !!match.team2);
  }

  onEventTriggerStartTimeChange(event_: any): void {
    const eventTriggerStartTime: Date = event_.value;
    console.log(`eventTriggerStartTime: ${eventTriggerStartTime}`);
    // TODO doResetScheduler
  }
}
