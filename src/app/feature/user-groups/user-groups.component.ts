import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { apiErrorItemMsgFormat, CommonResponse, GenericListResponse, GenericResponse, getApiErrorOverallType, isApiError, ParameterizedMessageTypeEnum, SessionData, UiError, UserGroup } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { ReplaceLineBreaksPipe } from 'src/app/shared/pipes/replace-line-breaks.pipe';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

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
    this.isUserGroupDialogDisplayed = true;
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

  onUserGroupDialogHide() {
    this.isUserGroupDialogDisplayed = false;
  }

  /**
	 * Creates a new user group from a popup window.
	 */
  doInsertUserGroup(event_: any, isImportConfirmed: boolean): void {
    console.log(`doInsertUserGroup`);
    // console.log(`event_: ${JSON.stringify(event_)}`);
    // this.isUserGroupDialogDisplayed = false;
    // this.isImportConfirmDialogDisplayed = false;
    this.isSubmitting = true;

    this.apiService.post<GenericResponse<UserGroup>>(ApiEndpoints.USER_GROUPS.INSERT_USER_GROUP+'?eventId={0}&userId={1}&name={2}&isInsertConfirmed={3}'
      .format(this.sessionService.getEvent().eventId, this.sessionService.getUser().userId, this.userGroup.name, isImportConfirmed)).subscribe({
      next: value => {
        console.log('inserted');
        const insertedUserGroup: UserGroup  = value.data;
        this.userGroups.push(insertedUserGroup);
        this.selectedUserGroup = insertedUserGroup;
        this.isSubmitting = false;
        this.isUserGroupDialogDisplayed = false;
        this.isImportConfirmDialogDisplayed = false;
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
              this.isUserGroupDialogDisplayed = false;
              this.isImportConfirmDialogDisplayed = true;
          }
          else {
            this.errors = new UiError(Object.assign(err));
          }
        }
        else {
          this.errors = new UiError(Object.assign(err));
        }
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('complete');
      }
    });
  }

  doResetUserGroup(event_: any): void {
    this.isUserGroupDialogDisplayed = false;
    this.isImportConfirmDialogDisplayed = false;
  }

  doImportUserGroup(event_: any): void {
  }
  
  onImportConfirmDialogHide() {
    this.isImportConfirmDialogDisplayed = false;
  }

}
