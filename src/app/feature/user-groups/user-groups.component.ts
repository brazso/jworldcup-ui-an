import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { apiErrorItemMsgFormat, CommonResponse, GenericListResponse, GenericResponse, getApiErrorOverallType, isApiError, ParameterizedMessageTypeEnum, SessionData, UiError, UserGroup } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { ReplaceLineBreaksPipe } from 'src/app/shared/pipes/replace-line-breaks.pipe';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

enum DisplayedComponentEnum {
  USER_GROUP_COMPONENT,
  USER_GROUP_DIALOG,
  IMPORT_CONFIRM_DIALOG
}

@Component({
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss']
})
export class UserGroupsComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  isSubmitting = false;
  errors: UiError = new UiError({});
  session: SessionData;
  userGroups: UserGroup[];
  selectedUserGroup: UserGroup | null;
  isUserGroupDialogDisplayed: boolean = false;
  userGroupDialogErrors: UiError = new UiError({});
  userGroup: UserGroup = {} as UserGroup; // inserted one
  @ViewChild('userGroupForm') userGroupForm: NgForm;
  confirmMsg: string;
  isImportConfirmDialogDisplayed: boolean = false;

  constructor(
    public readonly sessionService: SessionService,
    private readonly apiService: ApiService,
    private confirmationService: ConfirmationService,
    private translocoService: TranslocoService,
    private replaceLineBreaksPipe: ReplaceLineBreaksPipe
  ) { }

  ngOnInit(): void {
    this.subscription.add(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`user-groups.component/ngOnInit/session: ${JSON.stringify(session)}`);

        this.apiService.get<GenericListResponse<UserGroup>>(`${ApiEndpoints.USER_GROUPS.USER_GROUPS_BY_EVENT_AND_USER}?eventId=${this.sessionService.getEvent().eventId}&userId=${this.sessionService.getUser().userId}&isEverybodyIncluded=false`).subscribe(
          (value) => {
            this.userGroups = value.data;
            console.log(`user-groups.component/ngOnInit/userGroups: ${JSON.stringify(this.userGroups)}`);
          }
        );
      }
    ));
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  doInsert(event_: any): void {
    this.userGroup = {} as UserGroup;
    this.userGroupForm.resetForm();
    this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_DIALOG;
  }

  doDelete(event_: any): void {
    this.confirmationService.confirm({
      key: 'confirmDialog',
      message: this.replaceLineBreaksPipe.transform(this.translocoService.translate('userGroups.confirmation.deleteUserGroup')),
      accept: () => {
        console.log('user-groups.component/doDelete/Delete');
        this.deleteUserGroup();
      }
    });
  }

  /**
   * Deletes this.selectedUserGroup (after confirmation)
   */
  deleteUserGroup() : void {
    const userGroup = this.selectedUserGroup!;
    this.apiService.delete<CommonResponse>(ApiEndpoints.USER_GROUPS.DELETE_USER_GROUP.format(userGroup.userGroupId)).subscribe({
      next: value => {
        this.userGroups = this.userGroups.filter(e => e.userGroupId !== userGroup.userGroupId);
        this.selectedUserGroup = null;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`user-groups.component/deleteUserGroup/err: ${JSON.stringify(err)}`);
        this.errors = new UiError(Object.assign(err));
      },
      complete: () => {
        console.log('user-groups.component/deleteUserGroup/complete');
        this.errors = new UiError({});
      }
    });
  }

  onRowSelect(event_: any): void {
    // const selectedUserGroup: UserGroup = event_.data;
    console.log(`user-groups.component/onRowSelect data: ${JSON.stringify(event_.data)}`);
    console.log(`user-groups.component/onRowSelect selectedUserGroup: ${JSON.stringify(this.selectedUserGroup)}`);
  }

  onRowUnselect(event_: any): void {
    console.log(`user-groups.component/onRowUnselect`);
  }

  /**
	 * Creates a new user group from a popup window.
	 */
  doInsertUserGroup(event_: any, isImportConfirmed: boolean): void {
    console.log(`user-groups.component/doInsertUserGroup`);
    // console.log(`user-groups.component/event_: ${JSON.stringify(event_)}`);
    this.isSubmitting = true;

    this.apiService.post<GenericResponse<UserGroup>>(ApiEndpoints.USER_GROUPS.INSERT_USER_GROUP+'?eventId={0}&userId={1}&name={2}&isInsertConfirmed={3}'
      .format(this.sessionService.getEvent().eventId, this.sessionService.getUser().userId, this.userGroup.name, isImportConfirmed)).subscribe({
      next: value => {
        console.log('user-groups.component/doInsertUserGroup/nserted');
        const insertedUserGroup: UserGroup  = value.data;
        this.userGroups.push(insertedUserGroup);
        this.selectedUserGroup = insertedUserGroup;
        this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_COMPONENT;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`user-groups.component/doInsertUserGroup/err: ${JSON.stringify(err)}`);
        let error = err.error;
        if (error && isApiError(error) && error.items && getApiErrorOverallType(error) === ParameterizedMessageTypeEnum.INFO 
          && error.items.some(e => e.msgCode === 'USER_GROUP_NAME_OCCUPIED_ON_EARLIER_EVENT')) {
            let errorItem = error.items.find(e => e.msgCode === 'USER_GROUP_NAME_OCCUPIED_ON_EARLIER_EVENT');
            // console.log(`user-groups.component/errorItem: ${JSON.stringify(errorItem)}`);
            this.confirmMsg = apiErrorItemMsgFormat(errorItem!, this.translocoService.translate(errorItem!.msgCode));
            // console.log(`user-groups.component/confirmMsg: ${confirmMsg}`);
            this.displayedComponentEnum = DisplayedComponentEnum.IMPORT_CONFIRM_DIALOG;
        }
        else {
          this.userGroupDialogErrors = new UiError(Object.assign(err));
        }
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('user-groups.component/doInsertUserGroup/complete');
        this.isSubmitting = false;
      }
    });
  }

  doResetUserGroup(event_: any): void {
    console.log('user-groups.component/doResetUserGroup');
    this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_COMPONENT;
    this.userGroupDialogErrors = new UiError({});
  }

  doImportUserGroup(event_: any): void {
    this.apiService.post<GenericResponse<UserGroup>>(ApiEndpoints.USER_GROUPS.IMPORT_USER_GROUP+'?eventId={0}&userId={1}&name={2}'
      .format(this.sessionService.getEvent().eventId, this.sessionService.getUser().userId, this.userGroup.name)).subscribe({
      next: value => {
        console.log('user-groups.component/doImportUserGroup/imported');
        const importedUserGroup: UserGroup  = value.data;
        this.userGroups.push(importedUserGroup);
        this.selectedUserGroup = importedUserGroup;
        this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_COMPONENT;
        this.userGroupDialogErrors = new UiError({});
      },
      error: (err: HttpErrorResponse) => {
        console.log(`user-groups.component/doImportUserGroup/err: ${JSON.stringify(err)}`);
        this.userGroupDialogErrors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('user-groups.component/doImportUserGroup/complete');
        this.isSubmitting = false;
      }
    });
  }
  
  get displayedComponentEnum(): DisplayedComponentEnum {
    if (this.isUserGroupDialogDisplayed) {
      return DisplayedComponentEnum.USER_GROUP_DIALOG;
    }
    if (this.isImportConfirmDialogDisplayed) {
      return DisplayedComponentEnum.IMPORT_CONFIRM_DIALOG;
    }
    return DisplayedComponentEnum.USER_GROUP_COMPONENT;
  }

  set displayedComponentEnum(displayedComponent: DisplayedComponentEnum) {
    this.isUserGroupDialogDisplayed = displayedComponent === DisplayedComponentEnum.USER_GROUP_DIALOG;
    this.isImportConfirmDialogDisplayed = displayedComponent === DisplayedComponentEnum.IMPORT_CONFIRM_DIALOG;
  }
}
