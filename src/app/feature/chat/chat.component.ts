import { Component, OnDestroy, OnInit } from '@angular/core';
import { IWatchParams } from '@stomp/rx-stomp';
import { map, Subscription } from 'rxjs';
import { ApiService, Chat, GenericListResponse, RxStompService, SessionData, SessionDataModificationFlag, SessionService, UiError, User, UserGroup, UserGroupExtended } from 'src/app/core';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { Message } from '@stomp/stompjs';

@Component({
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  isSubmitting = false;
  errors: UiError = new UiError({});
  // session: SessionData;
  userGroups: UserGroupExtended[];
  //rooms: (User | UserGroup)[];
  selectedUserGroup: UserGroup | undefined;
  chatMap: Map<UserGroup, Chat[]> = new Map();
  subscriptionMap: Map<string, Subscription> = new Map();

  constructor(
    public readonly sessionService: SessionService,
    private readonly apiService: ApiService,
    private rxStompService: RxStompService,
    // private confirmationService: ConfirmationService,
    // private translocoService: TranslocoService,
    // private replaceLineBreaksPipe: ReplaceLineBreaksPipe
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        // this.session = session;
        console.log(`chat.component/session: ${JSON.stringify(session)}`);
        if ((session.modificationSet ?? []).includes(SessionDataModificationFlag.USER_GROUPS)) {
          this.userGroups = session.userGroups ?? [];
          console.log(`chat.component/userGroups: ${JSON.stringify(this.userGroups)}`);

          // new userGroups
          this.userGroups.forEach(userGroup => {
            const destination: string = `/topic/chat#${userGroup.userGroupId}`;
            if (!this.subscriptionMap.has(destination)) {
              const subscription: Subscription = this.rxStompService.watch({ destination, subHeaders: { durable: "false", exclusive: "false", 'auto-delete': "true" } } as IWatchParams).subscribe(
                (message: Message) => {
                  console.log(`chat.component/message received: ${JSON.stringify(message)}`);
                  // const session: SessionData = JSON.parse(message.body);
                  // console.log(`session.service/session received: ${JSON.stringify(session)}`);
                  // this.setSession(session);
                }
              );
              this.subscriptions.push(subscription);
              this.subscriptionMap.set(destination, subscription);
              console.log(`chat.component/added destination: ${destination}`);
            }
          });

          // dropped userGroups
          this.subscriptionMap.forEach((subscription: Subscription, destination: string) => {
            if (!this.userGroups.map(userGroup => `/topic/chat#${userGroup.userGroupId}`).includes(destination)) {
              this.subscriptions = this.subscriptions.filter(e => e !== subscription);
              subscription.unsubscribe();
              this.subscriptionMap.delete(destination);
              console.log(`chat.component/removed destination: ${destination}`);
            }
          });

          this.loadChats();
        }

        // this.apiService.get<GenericListResponse<UserGroup>>(`${ApiEndpoints.USER_GROUPS.USER_GROUPS_BY_EVENT_AND_USER}?eventId=${this.sessionService.getEvent().eventId}&userId=${this.sessionService.getUser().userId}&isEverybodyIncluded=true`).subscribe(
        //   (value) => {
        //     this.userGroups = value.data;
        //     console.log(`chat.component/userGroups: ${JSON.stringify(this.userGroups)}`);
        //     this.loadChats();
        //   }
        // );
      }
    ));

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Loads chats belongs to this.userGroups
   */
  loadChats(): void {
    for (const userGroup of this.userGroups) {
      this.apiService.get<GenericListResponse<Chat>>(`${ApiEndpoints.APPLICATION.RETRIEVE_CHATS}?eventId=${this.sessionService.getEvent().eventId}&userGroupId=${userGroup.userGroupId}`).subscribe(
        (value) => {
          this.chatMap.set(userGroup, value.data);
          console.log(`chat.component/chat: ${JSON.stringify(value.data)}`);
        }
      );
    }
  }

}
