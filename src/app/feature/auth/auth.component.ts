import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LangDefinition, Translation, TranslocoService } from '@ngneat/transloco';
import { ApiService, GenericResponse, SessionService, UiError, User, UserExtended } from 'src/app/core';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';

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
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    // use FormBuilder to create a form group
    this.authForm = this.fb.group({
      'username': ['', Validators.required],
      'password': ['', [Validators.required, Validators.minLength(8)]],
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
      // add additional form controls if this is the register page
      if (this.authType === 'register') {
        this.authForm.addControl('passwordAgain', new FormControl('', [Validators.required, Validators.minLength(8)]));
        this.authForm.addControl('fullName', new FormControl('', [Validators.required]));
        this.authForm.addControl('email', new FormControl('', [Validators.required, this.validateEmail]));
        this.authForm.addValidators(this.validatePasswords);
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
    console.log(`credentials: ${JSON.stringify(credentials)}`);

    if (this.authType === 'register') {
      const user: UserExtended = {
        loginName: credentials['username'],
        loginPasswordNew: credentials['password'],
        loginPasswordAgain: credentials['passwordAgain'],
        fullName: credentials['fullName'],
        emailAddr: credentials['email'],
        zoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
        languageTag: credentials['language']
      } as UserExtended;
      console.log(`user: ${JSON.stringify(user)}`);
      this.isSubmitting = false;
      this.apiService.post<GenericResponse<User>>(ApiEndpoints.SIGNUP, user).subscribe({
        next: value => {
          let savedUser: User = value.data;
          console.log(`savedUser: ${JSON.stringify(savedUser)}`);
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
    else {
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
  }

  onLanguageChange(event: any): void {
    const lang: string = event.value;
    console.log(`setActiveLang2: ${lang}`);
    this.translocoService.setActiveLang(lang);
  }

  validateEmail(control: FormControl): ValidationErrors | null {
    const email = control.value;
    console.log(`email: ${email}`);
    return !email || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) ? null : {email: {value: control.value}};
  }

  validatePasswords(form: /*FormGroup*/ AbstractControl): ValidationErrors | null {
    const isValid: boolean = (form.get("password")!.value ?? '') === (form.get("passwordAgain")!.value ?? '');
    return isValid ? null : {passwords: true};
  }
}
