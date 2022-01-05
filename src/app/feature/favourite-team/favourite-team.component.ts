import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { SessionService } from 'src/app/core/services';
import { UiError } from 'src/app/core/models';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';

@Component({
  // selector: 'app-favourite-team',
  templateUrl: './favourite-team.component.html',
  styleUrls: ['./favourite-team.component.scss']
})
export class FavouriteTeamComponent implements OnInit {

  isSubmitting = false;
  errors: UiError = new UiError({});
  
  constructor(
    // private readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly sessionService: SessionService,
  ) { }

  ngOnInit(): void {
  }

  doSave(event_: any): void {
  }

  doCancel(event_: any): void {
    this.sessionService.goToDefaultPage();
  }
}
