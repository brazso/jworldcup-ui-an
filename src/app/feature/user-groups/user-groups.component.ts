import { Component, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { GenericListResponse, SessionData, UiError, UserGroup } from 'src/app/core/models';
import { ApiService, SessionService } from 'src/app/core/services';
import { ReplaceLineBreaksPipe } from 'src/app/shared/pipes/replace-line-breaks.pipe';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';

@Component({
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss']
})
export class UserGroupsComponent implements OnInit {
  isSubmitting = false;
  errors: UiError = new UiError({});
  session: SessionData;
  // user: UserExtended; // edited object, it is a shallow copy of session.user
  userGroups: UserGroup[];
  selectedUserGroup: UserGroup | undefined;
  isUserGroupDialogDisplayed: boolean = false;
  userGroup: UserGroup = {} as UserGroup; // inserted one

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
    this.isUserGroupDialogDisplayed = true;
  }

  doDelete(event_: any): void {
    this.confirmationService.confirm({
      message: this.replaceLineBreaksPipe.transform(this.translocoService.translate('userGroups.confirmation.deleteUserGroup')),
      accept: () => {
        console.log('Delete');
        //Actual logic to perform a confirmation
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
  doInsertUserGroup(event_: any): void {
    // console.log(`doInsertUserGroup`);
    this.isUserGroupDialogDisplayed = false;
  }

  doResetUserGroup(event_: any): void {
    this.isUserGroupDialogDisplayed = false;
  }

  doImportUserGroup(event_: any): void {
  }
}
