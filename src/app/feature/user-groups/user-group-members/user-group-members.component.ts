import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, SimpleChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { CommonResponse, GenericListResponse, GenericResponse, SessionData, UiError, User, UserGroup } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { ReplaceLineBreaksPipe } from 'src/app/shared/pipes/replace-line-breaks.pipe';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-group-members',
  templateUrl: './user-group-members.component.html',
  styleUrls: ['./user-group-members.component.scss']
})
export class UserGroupMembersComponent implements OnInit, OnDestroy {
  @Input() selectedUserGroup: UserGroup | undefined;
  private subscriptions: Subscription[] = [];
  isSubmitting = false;
  errors: UiError = new UiError({});
  session: SessionData;
  userGroupMembers: User[];
  selectedUserGroupMember: User | undefined;
  isUserGroupMemberDialogDisplayed: boolean = false;
  userGroupMemberDialogErrors: UiError = new UiError({});
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
    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);
      }
    ));
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(`ngOnChanges: ${JSON.stringify(changes)}`);
    // this.doSomething(changes.categoryId.currentValue);
    //   // You can also use categoryId.previousValue and 
    //   // categoryId.firstChange for comparing old and new values
    this.apiService.get<GenericListResponse<User>>(`${ApiEndpoints.USER_GROUPS.USERS_BY_USER_GROUP}?userGroupId=${this.selectedUserGroup!.userGroupId}`).subscribe(
      (value) => {
        this.userGroupMembers = value.data;
        // console.log(`userGroupMembers: ${JSON.stringify(this.userGroupMembers)}`);
      }
    );
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
    console.log(`doAdd`);
    // this.userGroup = {} as UserGroup;
    // this.userGroupForm.resetForm();
    // this.displayedComponentEnum = DisplayedComponentEnum.USER_GROUP_DIALOG;
    this.isUserGroupMemberDialogDisplayed = true;
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
    // console.log(`event_: ${JSON.stringify(event_)}`);
    this.apiService.get<GenericListResponse<string>>(`${ApiEndpoints.USERS.FIND_USER_LOGIN_NAMES_BY_PREFIX}?loginNamePrefix=${event_.query}`).subscribe(
      (value) => {
        this.userGroupMemberLoginNameResults = value.data;
      }
    );
  }

  userGroupMemberFullNameComplete(event_: any): void {
    this.apiService.get<GenericListResponse<string>>(`${ApiEndpoints.USERS.FIND_USER_FULL_NAMES_BY_CONTAIN}?fullNameContain=${event_.query}`).subscribe(
      (value) => {
        this.userGroupMemberFullNameResults = value.data;
      }
    );
  }

  doAddUserGroupMember(event_: any): void {
    console.log(`doAddUserGroupMember`);
    console.log(`event_: ${JSON.stringify(event_)}`);
    this.isSubmitting = true;

    console.log(`userGroupMember: ${JSON.stringify(this.userGroupMember)}`);
    this.apiService.post<GenericResponse<User>>(ApiEndpoints.USER_GROUPS.FIND_AND_ADD_USER_TO_USER_GROUP+'?userGroupId={0}&loginName={1}&fullName={2}'
      .format(this.selectedUserGroup!.userGroupId, this.userGroupMember!.loginName ?? '', this.userGroupMember!.fullName ?? '')).subscribe({
      next: value => {
        console.log('added');
        const addedUser: User  = value.data;
        console.log(`addedUser: ${JSON.stringify(addedUser)}`);
        this.userGroupMembers.push(addedUser);
        this.selectedUserGroupMember = addedUser;
        this.doResetUserGroupMember(event_);
      },
      error: (err: HttpErrorResponse) => {
        console.log(`err: ${JSON.stringify(err)}`);
        this.userGroupMemberDialogErrors = new UiError(Object.assign(err));
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('complete');
        this.isSubmitting = false;
      }
    });
  }

  doResetUserGroupMember(event_: any): void {
    this.isUserGroupMemberDialogDisplayed = false;
    this.userGroupMemberDialogErrors = new UiError({});
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
