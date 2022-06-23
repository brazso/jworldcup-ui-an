import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IWatchParams } from '@stomp/rx-stomp';
import { Subscription } from 'rxjs';
import { ApiService, Chat, GenericListResponse, RxStompService, SessionData, SessionDataModificationFlag, SessionService, UiError, User, UserGroup } from 'src/app/core';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { Message } from '@stomp/stompjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

// export type ChatRoom = User | UserGroup;

export interface ChatRoom {
  userGroup?: UserGroup;
  user?: User; // private room
  chats: Chat[];
}

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
  activeIndex: number = 0; // for TabView/ChatRooms
  chatRooms: ChatRoom[];
  // chatMap: Map<ChatRoom, Chat[]> = new Map();
  message: string;
  subscriptionMap: Map<string, Subscription> = new Map();
  @ViewChild('messageInput') messageInputElement: ElementRef;

  constructor(
    public readonly sessionService: SessionService,
    private readonly apiService: ApiService,
    private rxStompService: RxStompService,
    private changeDetectorRef: ChangeDetectorRef
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
          this.chatRooms = (session.userGroups ?? []).map(e => ({userGroup: e} as ChatRoom));
          console.log(`chat.component/chatRooms: ${JSON.stringify(this.chatRooms)}`);

          // new userGroups
          this.chatRooms.filter(e => this.isChatRoomUserGroup(e)).map(e => e.userGroup!).forEach(userGroup => {
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
            if (!this.chatRooms.filter(e => this.isChatRoomUserGroup(e)).map(e => e.userGroup!).map(userGroup => `/topic/chat#${userGroup.userGroupId}`).includes(destination)) {
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
    for (const chatRoom of this.chatRooms.filter(e => this.isChatRoomUserGroup(e))) {
      this.apiService.get<GenericListResponse<Chat>>(`${ApiEndpoints.APPLICATION.RETRIEVE_CHATS}?eventId=${this.sessionService.getEvent().eventId}&userGroupId=${chatRoom.userGroup!.userGroupId}`).subscribe(
        (value) => {
          chatRoom.chats = value.data;
          console.log(`chat.component/loadChats/chat: ${JSON.stringify(value.data)}`);
        }
      );
    }
  }

  processChat(chat: Chat): void {
    console.log(`chat.component/processChat/chat: ${JSON.stringify(chat)}`);
    const chatRoom = this.getSelectedChatRoom();
    // chatRoom.chats.push(chat); // not enough that the UI would be updated...
    chatRoom.chats =  [...chatRoom.chats, chat]; // ...so the array must be recreated
    this.message = '';
  }

  getUsersByUserGroup(userGroup: UserGroup): User[] {
    return userGroup.virtualUsers ?? [];
  }

  isChatRoomUserGroup(chatRoom: ChatRoom): boolean {
    return 'userGroup' in chatRoom;
  }
  
  isChatRoomUser(chatRoom: ChatRoom): boolean {
    return 'user' in chatRoom;
  }
  
  onChangeTabView(event_: any): void {
    console.log(`chat.component/onChangeTabView/event: ${JSON.stringify(event_)}`);
    console.log(`chat.component/onChangeTabView/activeIndex: ${this.activeIndex}`);
    // this.selectedChatRoom = this.chatRooms[event_.index];
    this.message == '';
  }

  onCloseTabView(event_: any): void {
    console.log(`chat.component/onCloseTabView/event: ${JSON.stringify(event_)}`);
    console.log(`chat.component/onChangeTabView/activeIndex: ${this.activeIndex}`);
    this.chatRooms.splice(event_.index, 1); // remove closed chatRoom from its array
    this.activeIndex = 0;
  }

  onClickUser(user: User): void {
    console.log(`chat.component/onClickUser/user: ${JSON.stringify(user)}`);
    console.log(`chat.component/onChangeTabView/activeIndex: ${this.activeIndex}`);
  }

  getSelectedChatRoom(): ChatRoom {
    return this.chatRooms[this.activeIndex];
  }
  
  sendChatInit(): void {
    console.log(`chat.component/sendChatInit`);
    if (!this.message) {
      return;
    }
    const chatRoom = this.getSelectedChatRoom();

    const chat = { 
      event: this.sessionService.getEvent(), 
      user: this.sessionService.getUser(),
      message: this.message
    } as Chat;    
    if (this.isChatRoomUserGroup(chatRoom)) {
      chat.userGroup = chatRoom.userGroup;
    }
    else if (this.isChatRoomUserGroup(chatRoom)) {
      chat.user = chatRoom.user;
    }

    this.sendChat(chat);
  }

  sendChat(chat: Chat): void {
    console.log(`chat.component/sendChat`);
    this.apiService.post<void>(ApiEndpoints.CHATS.SEND_CHAT, chat)
    .subscribe({
      next: response => {
        console.log(`chat.component/sendChat/sentChat`);
      },
      error: (err: HttpErrorResponse) => {
        console.log(`chat.component/err: ${JSON.stringify(err)}`);
      },
      complete: () => {
        console.log('chat.component/complete');
      }
    });

  }

}
