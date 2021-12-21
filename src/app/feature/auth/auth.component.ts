import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AvailableLangs, LangDefinition, Translation, TranslocoService } from '@ngneat/transloco';

import { Errors, SessionService, UiError } from 'src/app/core';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  authType: string = '';
  title: string = '';
  errors: UiError = new UiError({});
  isSubmitting = false;
  authForm: FormGroup;
  availableLangs: LangDefinition[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translocoService: TranslocoService,
    private sessionService: SessionService,
    private fb: FormBuilder
  ) {
    // use FormBuilder to create a form group
    this.authForm = this.fb.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
      'language': ['']
    });
  }

  ngOnInit() {
    this.availableLangs = (this.translocoService.getAvailableLangs() as LangDefinition[])
      .sort((a, b) => a.label.localeCompare(b.label, this.translocoService.getActiveLang()));
    console.log(`this.availableLangs: ${JSON.stringify(this.availableLangs)}`);
    this.authForm.controls['language'].setValue(this.translocoService.getActiveLang());
    console.log(`activeLang: ${JSON.stringify(this.translocoService.getActiveLang())}`);

    this.route.url.subscribe(data => {
      // Get the last piece of the URL (it's either 'login' or 'register')
      this.authType = data[data.length - 1].path;
      // add form control for username if this is the register page
      if (this.authType === 'register') {
        this.authForm.addControl('email', new FormControl());
      }

      // wait until translation is being loaded
      this.translocoService.selectTranslation().subscribe((translation: Translation) => {
        // Set a title for the page accordingly
        this.title = this.translocoService.translate(`login.label.${this.authType}`);
      });
    });
  }

  submitForm() {
    this.isSubmitting = true;
    this.errors = new UiError({});

    const credentials = this.authForm.value;
    console.log(`credentials: ${JSON.stringify(credentials)}`)
    this.sessionService
      .attemptAuth(this.authType, credentials)
      .subscribe({
        next: session => {
          this.router.navigate([RouterUrls.HOME_PAGE]);
        },
        error: (err: HttpErrorResponse) => {
          console.log(`err: ${JSON.stringify(err)}`);
          this.errors = new UiError(Object.assign(err));
          this.isSubmitting = false;
        }
      });
  }

  onLanguageChange(event: any): void {
    const lang: string = event.value;
    console.log(`setActiveLang: ${lang}`);
    this.translocoService.setActiveLang(lang);
  }
}
