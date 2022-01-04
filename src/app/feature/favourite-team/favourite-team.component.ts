import { Component, OnInit } from '@angular/core';
import { UiError } from 'src/app/core/models';

@Component({
  // selector: 'app-favourite-team',
  templateUrl: './favourite-team.component.html',
  styleUrls: ['./favourite-team.component.scss']
})
export class FavouriteTeamComponent implements OnInit {

  isSubmitting = false;
  errors: UiError = new UiError({});
  
  constructor() { }

  ngOnInit(): void {
  }

  doSave(event_: any): void {
  }

  doCancel(event_: any): void {
  }
}
