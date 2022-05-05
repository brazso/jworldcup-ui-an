import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LangDefinition, Translation, TranslocoService } from '@ngneat/transloco';
import { ApiError, ApiErrorItem, ApiService, buildApiErrorByApiErrorItem, CommonResponse, GenericResponse, ParameterizedMessageTypeEnum, SessionService, UiError, User, UserExtended } from 'src/app/core';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { combineLatest } from 'rxjs';

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
      'language': ['']
    });
  }

  ngOnInit() {
    this.availableLangs = (this.translocoService.getAvailableLangs() as LangDefinition[])
      .sort((a, b) => a.label.localeCompare(b.label, this.translocoService.getActiveLang()));
    console.log(`this.availableLangs: ${JSON.stringify(this.availableLangs)}`);
    this.authForm.controls['language'].setValue(this.translocoService.getActiveLang());
    console.log(`activeLang: ${JSON.stringify(this.translocoService.getActiveLang())}`);

    combineLatest([
      this.route.url,
      this.route.queryParams
      ]).subscribe(([url, queryParams]) => {
        console.log(`url: ${JSON.stringify(url)}, queryParams: ${JSON.stringify(queryParams)}`)

      // Get the last piece of the URL (it's either 'login' or 'register')
      this.authType = url[url.length - 1].path;
      if (this.authType === 'login') {
        this.authForm.addControl('username', new FormControl('', [Validators.required]));
        this.authForm.addControl('password', new FormControl('', [Validators.required]));

        const func = queryParams['function']; // possible values: registration, changeEmail, resetPassword
        const token = queryParams['confirmation_token'];
        // console.log(`confirmation_token: ${JSON.stringify(queryParams['a'])}`);
        switch (func) {
          case 'registration':
            if (token) {
              this.processRegistrationToken(token);
            }
            else {
              this.errors = new UiError({url: 'dummy', error: buildApiErrorByApiErrorItem({
                msgCode: 'USER_CANDIDATE_LOGIN', 
                msgType: ParameterizedMessageTypeEnum.INFO, 
                msgParams: [], 
                msgBuilt: ''} as ApiErrorItem)});
            }
          break;

          case 'changeEmail':
            if (token) {
              this.processChangeEmailToken(token);
            }
          break;
          
          case 'resetPassword':
            if (token) {
              this.processResetPasswordToken(token);
            }
            else {
              this.errors = new UiError({url: 'dummy', error: buildApiErrorByApiErrorItem({
                msgCode: 'RESET_PASSWORD_INFO', 
                msgType: ParameterizedMessageTypeEnum.INFO, 
                msgParams: [], 
                msgBuilt: ''} as ApiErrorItem)});
            }
          break;
        }
      }
      else if (this.authType === 'register') {
        this.authForm.addControl('username', new FormControl('', [Validators.required]));
        this.authForm.addControl('password', new FormControl('', [Validators.required, Validators.minLength(8)]));
        this.authForm.addControl('passwordAgain', new FormControl('', [Validators.required, Validators.minLength(8)]));
        this.authForm.addControl('fullName', new FormControl('', [Validators.required]));
        this.authForm.addControl('email', new FormControl('', [Validators.required, this.validateEmail]));
        this.authForm.addValidators(this.validatePasswords);
      }
      else if (this.authType === 'reset-password') {
        this.authForm.addControl('email', new FormControl('', [Validators.required, this.validateEmail]));
      }

      // wait until translation is being loaded
      this.translocoService.selectTranslation().subscribe((translation: Translation) => {
        // Set a title for the page accordingly
        this.title = this.translocoService.translate(`login.label.${this.authType}`);
      });

      }
    );
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
          this.router.navigateByUrl('/'+RouterUrls.LOGIN+'?function=registration');
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
    else if (this.authType === 'reset-password') {
      this.isSubmitting = false;
      this.apiService.put<CommonResponse>(ApiEndpoints.USERS.RESET_PASSWORD+'?emailAddr={0}&languageTag={1}'.format(credentials['email'], credentials['language'])).subscribe({
        next: value => {
          this.isSubmitting = false;
          this.router.navigateByUrl('/'+RouterUrls.LOGIN+'?function=resetPassword');
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

  private processRegistrationToken(token: string): void {
    this.isSubmitting = true;
    this.errors = new UiError({});

    this.apiService.put<CommonResponse>(`${ApiEndpoints.USERS.PROCESS_REGISTRATION_TOKEN}?userToken=${token}`).subscribe({
      next: value => {
        console.log('processedRegistrationToken');
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

  private processChangeEmailToken(token: string): void {

  }

  private processResetPasswordToken(token: string): void {

  }


}
