import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LangDefinition, Translation, TranslocoService } from '@ngneat/transloco';
import { ApiErrorItem, ApiService, buildApiErrorByApiErrorItem, CommonResponse, GenericResponse, ParameterizedMessageTypeEnum, SessionService, UiError, User, UserExtended } from 'src/app/core';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { combineLatest, Subscription } from 'rxjs';
import { ToastMessageService, ToastMessageSeverity } from 'src/app/shared';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  readonly passwordMinLength : number = 8;
  private subscriptions: Subscription[] = [];
  authType: string = '';
  title: string = '';
  errors: UiError = new UiError({});
  isSubmitting = false;
  authForm: UntypedFormGroup;
  availableLangs: LangDefinition[];
  siteKeyCaptcha: string = "6LdAnY0iAAAAAPMFHecAgzoOH9caOgCD52OwpTty";
  recaptcha: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translocoService: TranslocoService, // used by html
    private sessionService: SessionService,
    private apiService: ApiService,
    private toastMessageService: ToastMessageService,
    private fb: UntypedFormBuilder,
    private location: Location
  ) {
    // use FormBuilder to create a form group
    this.authForm = this.fb.group({
      'language': [''],
      'captcha': new UntypedFormControl(true, [this.validateCaptcha]) // invalid
    });
  }

  ngOnInit() {
    this.recaptcha = (window as any).grecaptcha; // https://stackoverflow.com/questions/50794121/primeng-captcha-issue-with-angular-6#52788634
    this.availableLangs = (this.translocoService.getAvailableLangs() as LangDefinition[])
      .sort((a, b) => a.label.localeCompare(b.label, this.translocoService.getActiveLang()));
    console.log(`auth.component/this.availableLangs: ${JSON.stringify(this.availableLangs)}`);
    this.authForm.controls['language'].setValue(this.translocoService.getActiveLang());
    console.log(`auth.component/activeLang: ${JSON.stringify(this.translocoService.getActiveLang())}`);
    // this.authForm.controls['captcha'].addValidators([this.validateCaptcha]);

    combineLatest([
      this.route.url,
      this.route.queryParams
      ]).subscribe(([url, queryParams]) => {
        console.log(`auth.component/url: ${JSON.stringify(url)}, queryParams: ${JSON.stringify(queryParams)}`)

      // Get the last piece of the URL (it's either 'login' or 'register')
      this.authType = url[url.length - 1].path;
      if (this.authType === 'login') {
        this.authForm.addControl('username', new UntypedFormControl('', [Validators.required]));
        this.authForm.addControl('password', new UntypedFormControl('', [Validators.required]));

        const func = queryParams['function']; // possible values: registration, changeEmail, resetPassword
        const token = queryParams['confirmation_token'];
        // console.log(`auth.component/confirmation_token: ${JSON.stringify(queryParams['a'])}`);
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
        this.authForm.addControl('username', new UntypedFormControl('', [Validators.required]));
        this.authForm.addControl('password', new UntypedFormControl('', [Validators.required, Validators.minLength(this.passwordMinLength)]));
        this.authForm.addControl('passwordAgain', new UntypedFormControl('', [Validators.required, Validators.minLength(this.passwordMinLength)]));
        this.authForm.addControl('fullName', new UntypedFormControl('', [Validators.required]));
        this.authForm.addControl('email', new UntypedFormControl('', [Validators.required, this.validateEmail]));
        this.authForm.addValidators(this.validatePasswords);
      }
      else if (this.authType === 'reset-password') {
        this.authForm.addControl('email', new UntypedFormControl('', [Validators.required, this.validateEmail]));
      }

      // wait until translation is being loaded
      this.translocoService.selectTranslation().subscribe((translation: Translation) => {
        // Set a title for the page accordingly
        this.title = this.translocoService.translate(`login.label.${this.authType}`);
      });

      }
    );
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  submitForm() {
    this.isSubmitting = true;
    this.errors = new UiError({});

    const credentials = this.authForm.value;
    console.log(`auth.component/credentials: ${JSON.stringify(credentials)}`);

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
      console.log(`auth.component/user: ${JSON.stringify(user)}`);
      this.isSubmitting = false;
      this.apiService.post<GenericResponse<User>>(ApiEndpoints.SIGNUP, user).subscribe({
        next: value => {
          let savedUser: User = value.data;
          console.log(`auth.component/savedUser: ${JSON.stringify(savedUser)}`);
          this.isSubmitting = false;
          this.router.navigateByUrl('/'+RouterUrls.LOGIN+'?function=registration');
        },
        error: (err: HttpErrorResponse) => {
          console.log(`auth.component/err: ${JSON.stringify(err)}`);
          this.errors = new UiError(Object.assign(err));
          this.isSubmitting = false;
        },
        complete: () => {
          console.log('auth.component/complete');
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
          console.log(`auth.component/err: ${JSON.stringify(err)}`);
          this.errors = new UiError(Object.assign(err));
          this.isSubmitting = false;
        },
        complete: () => {
          console.log('auth.component/complete');
        }
      });
    }
    else {
      this.subscriptions.push(this.sessionService.attemptAuth(this.authType, credentials).subscribe({
        next: session => {
          this.router.navigate([RouterUrls.HOME_PAGE]);
        },
        error: (err: HttpErrorResponse) => {
          console.log(`auth.component/auth.component/err: ${JSON.stringify(err)}`);
          this.errors = new UiError(Object.assign(err));
          this.isSubmitting = false;
        }
      }));
    }
  }

  onLanguageChange(event: any): void {
    const lang: string = event.value;
    console.log(`auth.component/onLanguageChange/lang: ${lang}`);
    this.translocoService.setActiveLang(lang);
  }

  validateEmail(control: UntypedFormControl): ValidationErrors | null {
    const email = control.value;
    console.log(`auth.component/email: ${email}`);
    return !email || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) ? null : {email: {value: control.value}};
  }

  validatePasswords(form: /*FormGroup*/ AbstractControl): ValidationErrors | null {
    const isValid: boolean = (form.get("password")!.value ?? '') === (form.get("passwordAgain")!.value ?? '');
    return isValid ? null : {passwords: true};
  }

  validateCaptcha(control: AbstractControl): ValidationErrors | null {
    const captcha: boolean = control.value;
    return !captcha ? null : {captcha};
  }
  
  private processRegistrationToken(token: string): void {
    this.isSubmitting = true;
    this.errors = new UiError({});

    this.apiService.put<CommonResponse>(`${ApiEndpoints.USERS.PROCESS_REGISTRATION_TOKEN}?userToken=${token}`).subscribe({
      next: value => {
        console.log('auth.component/processRegistrationToken/next');
        this.isSubmitting = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`auth.component/processRegistrationToken/err: ${JSON.stringify(err)}`);
        this.errors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('auth.component/processRegistrationToken/complete');
      }
    });
  }

  private processChangeEmailToken(token: string): void {
    this.isSubmitting = true;
    this.errors = new UiError({});

    this.apiService.put<CommonResponse>(`${ApiEndpoints.USERS.PROCESS_CHANGE_EMAIL_TOKEN}?userToken=${token}`).subscribe({
      next: value => {
        console.log('auth.component/processChangeEmailToken/next');
        this.isSubmitting = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`auth.component/processChangeEmailToken/err: ${JSON.stringify(err)}`);
        this.errors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('auth.component/processChangeEmailToken/complete');
      }
    });
  }

  private processResetPasswordToken(token: string): void {
    this.isSubmitting = true;
    this.errors = new UiError({});

    this.apiService.put<CommonResponse>(`${ApiEndpoints.USERS.PROCESS_RESET_PASSWORD_TOKEN}?userToken=${token}`).subscribe({
      next: value => {
        console.log('auth.component/processResetPasswordToken/next');
        this.isSubmitting = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`auth.component/processResetPasswordToken/err: ${JSON.stringify(err)}`);
        this.errors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('auth.component/processResetPasswordToken/complete');
      }
    });
  }

  captchaResponse(event_: any): void {
    console.log(`auth.component/captchaResponse/event_: ${JSON.stringify(event_)}`);
    const response: string = event_.response;
    this.authForm.controls['captcha'].setValue(false); // validate captcha
    this.apiService.post<CommonResponse>(`${ApiEndpoints.VERIFY_CAPTCHA}?response=${response}`).subscribe(
      (value: CommonResponse) => {
        console.log(`auth.component/captchaResponse/value: ${JSON.stringify(value)}`);
        if (!value.successful) {
          this.toastMessageService.displayMessage(ToastMessageSeverity.ERROR, 'general.error.captcha');
        }
      }
    );
  }

  captchaExpire(): void {
    console.log(`auth.component/captchaExpire`);
    this.authForm.controls['captcha'].setValue(true); // invalidate captcha
  }
}
