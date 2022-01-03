import { Component, OnInit } from '@angular/core';
import { Bet, CommonResponse, Event, GenericListResponse, GenericResponse, getShortDescWithYearByEvent, Match, Round, SessionData } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { distinctArrayByPropertyName } from 'src/app/shared/utils';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { BetComponent } from '../bet.component';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-bets',
  templateUrl: './bets.component.html',
  styleUrls: ['./bets.component.scss']
})
export class BetsComponent implements OnInit {
  title: string;
  event: Event = {};
  bets: Bet[] = [];
  matches: Match[] = [];
  rounds: Round[] = [];
  // betByMatchIdMap: { [matchId: number]: Bet } = {};
  eventTriggerStartTimes: Date[] = [];
  selectedBet: Bet;
  cmItems: MenuItem[]; // contextMenu

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
      this.title = this.translocoService.translate('bets.title');

      this.cmItems = [
        {label: this.translocoService.translate('general.button.edit'), icon: 'pi pi-fw pi-pencil', command: () => this.editBet(this.selectedBet)},
        {label: this.translocoService.translate('general.button.reset'), icon: 'pi pi-fw pi-times', command: () => this.resetBet(this.selectedBet)}
      ];
    });

    this.sessionService.event.subscribe(
      (event: Event) => {
        this.event = event;
        console.log(`event: ${JSON.stringify(event)}`);

        forkJoin([
          this.apiService.get<GenericListResponse<Match>>(`${ApiEndpoints.MATCHES.MATCHES_BY_EVENT}?eventByShortDescWithYear=${getShortDescWithYearByEvent(this.event)}`),
          this.apiService.get<GenericListResponse<Bet>>(`${ApiEndpoints.BETS.BETS_BY_EVENT_AND_USER}?eventId=${this.event.eventId}&userId=${this.sessionService.getUser().userId}`)
          ]).subscribe(([matchResponse, betResponse]) => {
            this.matches = matchResponse.data;
            console.log(`matches.length: ${this.matches.length}`);

            // retrieve rounds from loaded matches
            this.rounds = distinctArrayByPropertyName<Round>(this.matches.map(e => e.round as Round), 'roundId').sort((a, b) => a.roundId! - b.roundId!);
            console.log(`rounds: ${JSON.stringify(this.rounds)}`);

            // // init betByMatchIdMap
            // this.matches.forEach((match) => {
            //   this.betByMatchIdMap[match.matchId!] = {};
            // });
            this.bets = [];
            this.matches.forEach((match) => {
              // this.betByMatchIdMap[match.matchId!] = {};
              this.bets.push({match: match, user: this.sessionService.getUser()} as Bet); // dummy bet only with match and user properties
            });

            const bets: Bet[] = betResponse.data;
            console.log(`bets.length: ${bets.length}`);

            // link each bet to proper match from matches array
            // this.betByMatchIdMap = {};
            bets.forEach((bet) =>{
              console.log(`betId: ${bet.betId}`);
              // const match = this.matches.find(e => e.matchId === bet.match?.matchId);
              // if (match) {
              //   this.betByMatchIdMap[bet.match?.matchId!] = match;
              // }
              const index = this.bets.findIndex(e => e.match?.matchId == bet.match?.matchId);
              console.log(`index: ${index}`);
              if (index !== -1) {
                this.bets[index] = bet;
              }
            });
          }
        );

      }
    );

    this.sessionService.session.subscribe(
      (session: SessionData) => {
        // TODO
      }
    );
  }

  filterBetsByRound(round: Round): Bet[] {
    return this.bets.filter(e => e.match?.round?.roundId === round.roundId);
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

  editBet(bet: Bet) {
    console.log('editBet');

    const ref = this.dialogService.open(BetComponent, {
      data: {
        betId: bet?.betId,
        matchId: bet?.match?.matchId
      },
      header: this.translocoService.translate('betDetail.title'),
      // closable: false,
      // showHeader: false, // header and closeable are ignored
      // width: '70%'
    });

    ref.onClose.subscribe((bet: Bet) => {
      console.log(`onClose bet: ${JSON.stringify(bet)}`);
      if (bet) {
        // replace selectedBet inside bets to the incoming one
        const index = this.bets.findIndex(e => e.match?.matchId == bet.match?.matchId);
        console.log(`index: ${index}`);
        if (index !== -1) {
          this.bets[index] = bet;
          this.selectedBet = bet;
        }
      }
    });
  }

  resetBet(bet: Bet) {
    console.log('resetBet');

    if (!bet.betId) {
      return;
    }

    this.apiService.delete<CommonResponse>(ApiEndpoints.BETS.DELETE_BET.format(bet.betId)).subscribe({
      next: value => {
        // empty selectedBet inside bets
        const index = this.bets.findIndex(e => e.betId === bet.betId);
        if (index !== -1) {
          this.bets[index] = {match: bet.match, user: this.sessionService.getUser()} as Bet
          this.selectedBet = this.bets[index];
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

  isMatchNotStarted(match: Match): boolean {
    return (!!match.team1 && !!match.team2
      && this.sessionService.getSession().actualDateTime! < match.startTime!);
	}
}
