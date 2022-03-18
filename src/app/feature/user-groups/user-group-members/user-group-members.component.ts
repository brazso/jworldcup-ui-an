import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { CommonResponse, GenericListResponse, SessionData, UiError, User, UserGroup } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { ReplaceLineBreaksPipe } from 'src/app/shared/pipes/replace-line-breaks.pipe';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-group-members',
  templateUrl: './user-group-members.component.html',
  styleUrls: ['./user-group-members.component.scss']
})
export class UserGroupMembersComponent implements OnInit {
  @Input() selectedUserGroup: UserGroup | undefined;
  isSubmitting = false;
  errors: UiError = new UiError({});
  session: SessionData;
  userGroupMembers: User[];
  selectedUserGroupMember: User | undefined;
  isUserGroupMemberDialogDisplayed: boolean = false;
  userGroupMember: User = {} as User; // added one
  userGroupMemberLoginNameResults: string[];
  userGroupMemberFullNameResults: string[];
  @ViewChild('userGroupMemberForm') userGroupMemberForm: NgForm;
  confirmMsg: string;

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
      }
    );  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(`ngOnChanges: ${JSON.stringify(changes)}`);
    // this.doSomething(changes.categoryId.currentValue);
    //   // You can also use categoryId.previousValue and 
    //   // categoryId.firstChange for comparing old and new values
    this.apiService.get<GenericListResponse<User>>(`${ApiEndpoints.USER_GROUPS.USER_BY_USER_GROUP}?userGroupId=${this.selectedUserGroup!.userGroupId}`).subscribe(
      (value) => {
        this.userGroupMembers = value.data;
        // console.log(`userGroupMembers: ${JSON.stringify(this.userGroupMembers)}`);
      }
    );
  }
    
  onRowSelect(event_: any): void {
    // const selectedUserGroup: UserGroup = event_.data;
    console.log(`onRowSelect data: ${JSON.stringify(event_.data)}`);
    console.log(`onRowSelect data2: ${JSON.stringify(this.selectedUserGroupMember)}`);
  }

  onRowUnselect(event_: any): void {
    console.log(`onRowUnselect`);
  }

  doAdd(event_: any): void {
    // this.userGroup = {} as UserGroup;
    // this.userGroupForm.resetForm();
    // this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_DIALOG;
  }

  doRemove(event_: any): void {
    this.confirmationService.confirm({
      key: 'confirmDialog',
      message: this.replaceLineBreaksPipe.transform(this.translocoService.translate('userGroupMembers.confirmation.removeMemberFromUserGroup')),
      accept: () => {
        this.doRemoveUserGroupMember(event_);
      }
    });
  }

  userGroupMemberLoginNameComplete(event_: any): void {
    // this.mylookupservice.getResults(event.query).then(data => {
    //     this.results = data;
    // });
  }

  userGroupMemberFullNameComplete(event_: any): void {
    // this.mylookupservice.getResults(event.query).then(data => {
    //     this.results = data;
    // });
  }

  doAddUserGroupMember(event_: any): void {
    console.log(`doAddUserGroupMember`);
    // console.log(`event_: ${JSON.stringify(event_)}`);
    // this.isSubmitting = true;

    // this.apiService.post<GenericResponse<UserGroup>>(ApiEndpoints.USER_GROUPS.INSERT_USER_GROUP+'?eventId={0}&userId={1}&name={2}&isInsertConfirmed={3}'
    //   .format(this.sessionService.getEvent().eventId, this.sessionService.getUser().userId, this.userGroup.name, isImportConfirmed)).subscribe({
    //   next: value => {
    //     console.log('inserted');
    //     const insertedUserGroup: UserGroup  = value.data;
    //     this.userGroups.push(insertedUserGroup);
    //     this.selectedUserGroup = insertedUserGroup;
    //     this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_COMPONENT;
    //   },
    //   error: (err: HttpErrorResponse) => {
    //     console.log(`err: ${JSON.stringify(err)}`);
    //     let error = err.error;
    //     if (error && isApiError(error) && error.items && getApiErrorOverallType(error) === ParameterizedMessageTypeEnum.INFO 
    //       && error.items.some(e => e.msgCode === 'USER_GROUP_NAME_OCCUPIED_ON_EARLIER_EVENT')) {
    //         let errorItem = error.items.find(e => e.msgCode === 'USER_GROUP_NAME_OCCUPIED_ON_EARLIER_EVENT');
    //         // console.log(`errorItem: ${JSON.stringify(errorItem)}`);
    //         this.confirmMsg = apiErrorItemMsgFormat(errorItem!, this.translocoService.translate(errorItem!.msgCode));
    //         // console.log(`confirmMsg: ${confirmMsg}`);
    //         this.displayedComponentEnum = DisplayedComponentEnum.IMPORT_CONFIRM_DIALOG;
    //     }
    //     else {
    //       this.errors = new UiError(Object.assign(err));
    //     }
    //   },
    //   complete: () => {
    //     console.log('complete');
    //     this.isSubmitting = false;
    //   }
    // });
  }

  doResetUserGroupMember(event_: any): void {
    // this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_COMPONENT;
  }

  doRemoveUserGroupMember(event_: any): void {
    const userGroup = this.selectedUserGroup!;
    const user = this.selectedUserGroupMember!;
    this.apiService.delete<CommonResponse>(ApiEndpoints.USER_GROUPS.DELETE_USER_FROM_USER_GROUP+'?userGroupId={0}&userId={1}'.format(userGroup.userGroupId, user.userId)).subscribe({
      next: value => {
        this.userGroupMembers = this.userGroupMembers.filter(e => e.userId !== user.userId);
        this.selectedUserGroupMember = undefined;
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
}
