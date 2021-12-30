import { Component, OnInit } from '@angular/core';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService, GenericListResponse, GenericResponse, Match } from 'src/app/core';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';

@Component({
  // no selector here because it is a primeNG dynamic dialog
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {
  match: Match = {};

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
}
