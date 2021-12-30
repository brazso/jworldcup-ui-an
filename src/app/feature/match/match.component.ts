import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService, GenericListResponse, GenericResponse, Match, UiError } from 'src/app/core';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';

@Component({
  // no selector here because it is a primeNG dynamic dialog
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {
  match: Match = {};
  isSubmitting = false;
  errors: UiError = new UiError({});

  constructor(
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig,
    private translocoService: TranslocoService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      // Set a title for the page accordingly
      // this.config.header = this.translocoService.translate('matchDetail.title');
      console.log('selectTranslation');
    });

    console.log(`this.config.data: ${JSON.stringify(this.config.data)}`);
    const matchId = this.config.data.matchId;

    this.apiService.get<GenericResponse<Match>>(ApiEndpoints.MATCHES.MATCH.format(matchId)).subscribe(
      (value: GenericResponse<Match>) => {
        this.match = value.data;
      }
    );
  }

  selectMatch() {
    this.ref.close(this.match);
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

    this.apiService.put<GenericResponse<Match>>(ApiEndpoints.MATCHES.SAVE_MATCH, this.match).subscribe({
      next: value => {
        console.log('saved');
        this.match = value.data;
        this.ref.close(this.match);
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
