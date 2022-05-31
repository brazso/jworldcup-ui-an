import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService, Bet, GenericResponse, Match, SessionService, UiError } from 'src/app/core';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';

@Component({
  // no selector here because it is a primeNG dynamic dialog
  templateUrl: './bet.component.html',
  styleUrls: ['./bet.component.scss']
})
export class BetComponent implements OnInit {
  bet: Bet = {};
  match: Match = {};
  isSubmitting = false;
  errors: UiError = new UiError({});

  constructor(
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig,
    private translocoService: TranslocoService,
    private apiService: ApiService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      // Set a title for the page accordingly
      // this.config.header = this.translocoService.translate('matchDetail.title');
      console.log('bet.component/selectTranslation');
    });

    console.log(`bet.component/this.config.data: ${JSON.stringify(this.config.data)}`);
    const betId: number | undefined = this.config.data.betId;
    const matchId: number = this.config.data.matchId;

    if (betId) {
      this.apiService.get<GenericResponse<Bet>>(ApiEndpoints.BETS.BET.format(betId)).subscribe(
        (value: GenericResponse<Bet>) => {
          this.bet = value.data;
        }
      );
    }
    else {
      this.apiService.get<GenericResponse<Match>>(ApiEndpoints.MATCHES.MATCH.format(matchId)).subscribe(
        (value: GenericResponse<Match>) => {
          this.bet = {match: value.data, user: this.sessionService.getUser()} as Bet;
        }
      );
    }
  }

  doSave(event_: any): void {
    this.submitForm();
  }

  doCancel(event_: any): void {
    this.ref.close();
  }

  submitForm() {
    this.isSubmitting = true;
    this.errors = new UiError({});

    this.apiService.put<GenericResponse<Bet>>(ApiEndpoints.BETS.SAVE_BET, this.bet).subscribe({
      next: value => {
        console.log('bet.component/saved');
        this.bet = value.data;
        this.ref.close(this.bet);
        this.isSubmitting = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`bet.component/err: ${JSON.stringify(err)}`);
        this.errors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('bet.component/complete');
      }
    });
  }
}
