import { Component, OnDestroy, OnInit } from '@angular/core';
import { IWatchParams } from '@stomp/rx-stomp';
import { map, Subscription } from 'rxjs';
import { ApiService, Chat, GenericListResponse, RxStompService, SessionData, SessionDataModificationFlag, SessionService, UiError, User, UserGroup } from 'src/app/core';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { Message } from '@stomp/stompjs';

export type ChatRoom = User | UserGroup;

@Component({
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  isSubmitting = false;
  errors: UiError = new UiError({});
  // session: SessionData;
  // userGroups: UserGroup[];
  chatRooms: ChatRoom[];
  // selectedUserGroup: UserGroup | undefined;
  chatMap: Map<ChatRoom, Chat[]> = new Map();
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
    console.log(`chat.component/ngOnInit`);
    this.subscriptions.push(this.sessionService.session.subscribe(
      (session: SessionData) => {
        // this.session = session;
        console.log(`chat.component/session: ${JSON.stringify(session)}`);
        if (!this.chatRooms || (session.modificationSet ?? []).includes(SessionDataModificationFlag.USER_GROUPS)) {
          this.chatRooms = session.userGroups ?? [];
          console.log(`chat.component/chatRooms: ${JSON.stringify(this.chatRooms)}`);

          // new userGroups
          this.chatRooms.filter(e => this.isChatRoomUserGroup(e)).map(e => e as UserGroup).forEach(userGroup => {
            const destination: string = `/topic/chat#${userGroup.userGroupId}`;
            if (!this.subscriptionMap.has(destination)) {
              const subscription: Subscription = this.rxStompService.watch({ destination, subHeaders: { durable: "false", exclusive: "false", 'auto-delete': "true" } } as IWatchParams).subscribe(
                (message: Message) => {
                  console.log(`chat.component/message received: ${JSON.stringify(message)}`);
                  const chat: Chat = JSON.parse(message.body);
                  this.processChat(chat);
                }
              );
              this.subscriptions.push(subscription);
              this.subscriptionMap.set(destination, subscription);
              console.log(`chat.component/added destination: ${destination}`);
            }
          });

          // dropped userGroups
          this.subscriptionMap.forEach((subscription: Subscription, destination: string) => {
            if (!this.chatRooms.filter(e => this.isChatRoomUserGroup(e)).map(e => e as UserGroup).map(userGroup => `/topic/chat#${userGroup.userGroupId}`).includes(destination)) {
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
    console.log(`chat.component/ngOnDestroy`);
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Loads chats belongs to this.userGroups
   */
  loadChats(): void {
    for (const userGroup of this.chatRooms.filter(e => this.isChatRoomUserGroup(e)).map(e => e as UserGroup)) {
      this.apiService.get<GenericListResponse<Chat>>(`${ApiEndpoints.APPLICATION.RETRIEVE_CHATS}?eventId=${this.sessionService.getEvent().eventId}&userGroupId=${userGroup.userGroupId}`).subscribe(
        (value) => {
          this.chatMap.set(userGroup, value.data);
          console.log(`chat.component/loadChats/chat: ${JSON.stringify(value.data)}`);
        }
      );
    }
  }

  processChat(chat: Chat): void {
    console.log(`chat.component/processChat/chat: ${JSON.stringify(chat)}`);
  }

  getUsersByUserGroup(userGroup: UserGroup): User[] {
    return userGroup.virtualUsers ?? [];
  }

  isChatRoomUserGroup(chatRoom: ChatRoom): chatRoom is UserGroup {
    return 'userGroupId' in chatRoom;
  }
  
  isChatRoomUser(chatRoom: ChatRoom): chatRoom is User {
    return 'userId' in  chatRoom;
  }
  
  
}
