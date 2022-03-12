import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { apiErrorItemMsgFormat, CommonResponse, GenericListResponse, GenericResponse, getApiErrorOverallType, isApiError, ParameterizedMessageTypeEnum, SessionData, UiError, UserGroup } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { ReplaceLineBreaksPipe } from 'src/app/shared/pipes/replace-line-breaks.pipe';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

enum DisplayedComponentEnum {
  USER_GROUP_COMPONENT,
  USER_GROUP_DIALOG,
  IMPORT_CONFIRM_DIALOG
}

@Component({
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss']
})
export class UserGroupsComponent implements OnInit {
  isSubmitting = false;
  errors: UiError = new UiError({});
  session: SessionData;
  userGroups: UserGroup[];
  selectedUserGroup: UserGroup | undefined;
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
    this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);

        this.apiService.get<GenericListResponse<UserGroup>>(`${ApiEndpoints.USER_GROUPS.USER_GROUPS_BY_EVENT_AND_USER}?eventId=${this.sessionService.getEvent().eventId}&userId=${this.sessionService.getUser().userId}&isEverybodyIncluded=false`).subscribe(
          (value) => {
            this.userGroups = value.data;
            console.log(`userGroups: ${JSON.stringify(this.userGroups)}`);
          }
        );
      }
    );
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
        console.log('Delete');
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
        this.selectedUserGroup = undefined;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`err: ${JSON.stringify(err)}`);
        this.errors = new UiError(Object.assign(err));
      },
      complete: () => {
        console.log('complete');
        this.errors = new UiError({});
      }
    });
  }

  onRowSelect(event_: any): void {
    // const selectedUserGroup: UserGroup = event_.data;
    console.log(`onRowSelect data: ${JSON.stringify(event_.data)}`);
    console.log(`onRowSelect data2: ${JSON.stringify(this.selectedUserGroup)}`);
  }

  onRowUnselect(event_: any): void {
    console.log(`onRowUnselect`);
  }

  /**
	 * Creates a new user group from a popup window.
	 */
  doInsertUserGroup(event_: any, isImportConfirmed: boolean): void {
    console.log(`doInsertUserGroup`);
    // console.log(`event_: ${JSON.stringify(event_)}`);
    this.isSubmitting = true;

    this.apiService.post<GenericResponse<UserGroup>>(ApiEndpoints.USER_GROUPS.INSERT_USER_GROUP+'?eventId={0}&userId={1}&name={2}&isInsertConfirmed={3}'
      .format(this.sessionService.getEvent().eventId, this.sessionService.getUser().userId, this.userGroup.name, isImportConfirmed)).subscribe({
      next: value => {
        console.log('inserted');
        const insertedUserGroup: UserGroup  = value.data;
        this.userGroups.push(insertedUserGroup);
        this.selectedUserGroup = insertedUserGroup;
        this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_COMPONENT;
      },
      error: (err: HttpErrorResponse) => {
        console.log(`err: ${JSON.stringify(err)}`);
        let error = err.error;
        if (error && isApiError(error) && error.items) {
          if (getApiErrorOverallType(error) === ParameterizedMessageTypeEnum.INFO 
            && error.items.some(e => e.msgCode === 'USER_GROUP_NAME_OCCUPIED_ON_EARLIER_EVENT')) {
              let errorItem = error.items.find(e => e.msgCode === 'USER_GROUP_NAME_OCCUPIED_ON_EARLIER_EVENT');
              // console.log(`errorItem: ${JSON.stringify(errorItem)}`);
              this.confirmMsg = apiErrorItemMsgFormat(errorItem!, this.translocoService.translate(errorItem!.msgCode));
              // console.log(`confirmMsg: ${confirmMsg}`);
              this.displayedComponentEnum = DisplayedComponentEnum.IMPORT_CONFIRM_DIALOG;
              this.userGroupDialogErrors = new UiError({});
          }
          else {
            this.userGroupDialogErrors = new UiError(Object.assign(err));
          }
        }
        else {
          this.userGroupDialogErrors = new UiError(Object.assign(err));
        }
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('complete');
        this.isSubmitting = false;
      }
    });
  }

  doResetUserGroup(event_: any): void {
    console.log('doResetUserGroup');
    this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_COMPONENT;
    this.userGroupDialogErrors = new UiError({});
  }

  doImportUserGroup(event_: any): void {
    this.apiService.post<GenericResponse<UserGroup>>(ApiEndpoints.USER_GROUPS.IMPORT_USER_GROUP+'?eventId={0}&userId={1}&name={2}'
      .format(this.sessionService.getEvent().eventId, this.sessionService.getUser().userId, this.userGroup.name)).subscribe({
      next: value => {
        console.log('imported');
        const importedUserGroup: UserGroup  = value.data;
        this.userGroups.push(importedUserGroup);
        this.selectedUserGroup = importedUserGroup;
        this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_COMPONENT;
        this.userGroupDialogErrors = new UiError({});
      },
      error: (err: HttpErrorResponse) => {
        console.log(`err: ${JSON.stringify(err)}`);
        this.userGroupDialogErrors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('complete');
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
