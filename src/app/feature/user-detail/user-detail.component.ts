import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { CommonResponse, GenericMapResponse, GenericResponse, SessionData, UiError, User, UserExtended } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoService } from '@ngneat/transloco';
import { ReplaceLineBreaksPipe } from 'src/app/shared/pipes/replace-line-breaks.pipe';
import { NgForm, NgModel } from '@angular/forms';
import { InputValidationComponent } from 'src/app/shared/input-validation';
import { Subscription } from 'rxjs';
import { ToastMessageService, ToastMessageSeverity } from 'src/app/shared/services';

@Component({
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  isSubmitting = false;
  errors: UiError = new UiError({});
  session: SessionData;
  zoneIds: SelectItem<string>[];
  user: UserExtended; // edited object, it is a shallow copy of session.user
  @ViewChildren(InputValidationComponent) private childrenInputValidationComponents: QueryList<InputValidationComponent>;

  constructor(
    private readonly sessionService: SessionService,
    private readonly apiService: ApiService,
    private confirmationService: ConfirmationService,
    private translocoService: TranslocoService,
    private toastMessageService: ToastMessageService,
    private replaceLineBreaksPipe: ReplaceLineBreaksPipe
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);

        this.user = {...session.user!}; // shallow copy is enough for user object
        this.user.languageTag = session.localeId;

        this.apiService.get<GenericMapResponse<string>>(ApiEndpoints.USERS.FIND_TIME_ZONE_IDS).subscribe(
          (value) => {
            this.zoneIds = Object.entries(value.data).map(e => ({label: e[0]+" ("+e[1]+")", value: e[0]}) as SelectItem<string>)
            // console.log(`zoneIds: ${JSON.stringify(this.zoneIds)}`);
          }
        );
      }
    ));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  doDelete(event_: any): void {
    this.confirmationService.confirm({
      message: this.replaceLineBreaksPipe.transform(this.translocoService.translate('userDetail.popup.confirm.deleteUser')),
      accept: () => {
        console.log('Delete');
        //Actual logic to perform a confirmation
        this.apiService.delete<CommonResponse>(ApiEndpoints.USERS.DELETE_USER_BY_LOGIN_NAME+'?loginName={0}'.format(this.user.loginName)).subscribe({
          next: value => {
            this.sessionService.logout();
          },
          error: (err: HttpErrorResponse) => {
            console.log(`err: ${JSON.stringify(err)}`);
            this.errors = new UiError(Object.assign(err));
          },
          complete: () => {
            console.log('complete');
          }
        });
      }
  });
  }

  doSave(event_: any): void {
    console.log(`user: ${JSON.stringify(this.user)}`);
    this.submitForm();
  }

  doCancel(event_: any): void {
    console.log(`cancel user: ${JSON.stringify(this.user)}, session.user: ${JSON.stringify(this.session.user)}`);
    this.sessionService.goToDefaultPage();
  }

  validateEmail(context: NgModel ): boolean {
    // console.log(`validateEmail context.control.value:${JSON.stringify(context.control.value)}`)
    const email = context.control.value;
    return !email || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  }

  validateEmails(context: NgForm ): boolean {
    return (context.form.value.emailNew ?? '') === (context.form.value.emailNewAgain ?? '');
  }

  validatePasswords(context: NgForm ): boolean {
    return (context.form.value.loginPasswordNew ?? '') === (context.form.value.loginPasswordAgain ?? '');
  }

  hasError(): boolean {
    return (this.childrenInputValidationComponents ?? []).some(e => e.hasError());
  }
  
  submitForm() {
    this.isSubmitting = true;
    this.errors = new UiError({});

    this.apiService.put<GenericResponse<User>>(ApiEndpoints.USERS.MODIFY_USER, this.user).subscribe({
      next: value => {
        console.log('saved');
        const modifiedUser: User  = value.data;
        this.sessionService.getSession().user = modifiedUser;
        if (modifiedUser.emailNew) {
          this.toastMessageService.displayMessage(ToastMessageSeverity.INFO, 'userDetail.popup.sendChangeEmail');
        }
        this.isSubmitting = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`err: ${JSON.stringify(err)}`);
        this.errors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('complete');
        this.sessionService.goToDefaultPage();
      }
    });
  }
}
