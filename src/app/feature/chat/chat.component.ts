import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IWatchParams } from '@stomp/rx-stomp';
import { Subscription } from 'rxjs';
import { ApiService, Chat, GenericListResponse, GenericResponse, RxStompService, SessionData, SessionDataModificationFlag, SessionService, UiError, User, UserGroup } from 'src/app/core';
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
        console.log(`chat.component/ngOnInit/session: ${JSON.stringify(session)}`);
        if (!this.chatRooms || (session.modificationSet ?? []).includes(SessionDataModificationFlag.USER_GROUPS)) {
          this.chatRooms = (session.userGroups ?? []).map(e => ({userGroup: e} as ChatRoom));
          console.log(`chat.component/ngOnInit/chatRooms: ${JSON.stringify(this.chatRooms)}`);
          this.activeIndex = 0;

          // new userGroups
          this.chatRooms.filter(e => this.isChatRoomUserGroup(e)).map(e => e.userGroup!).forEach(userGroup => {
            const destination: string = `/topic/chat#${userGroup.userGroupId}`;
            if (!this.subscriptionMap.has(destination)) {
              const subscription: Subscription = this.rxStompService.watch({ destination, subHeaders: { durable: "false", exclusive: "false", 'auto-delete': "false" } } as IWatchParams).subscribe(
                (message: Message) => {
                  console.log(`chat.component/ngOnInit/message received: ${JSON.stringify(message)}`);
                  const chat: Chat = JSON.parse(message.body);
                  this.processChat(chat);
                }
              );
              this.subscriptions.push(subscription);
              this.subscriptionMap.set(destination, subscription);
              console.log(`chat.component/ngOnInit/added destination: ${destination}`);
            }
          });

          // dropped userGroups
          this.subscriptionMap.forEach((subscription: Subscription, destination: string) => {
            if (!this.chatRooms.filter(e => this.isChatRoomUserGroup(e)).map(e => e.userGroup!).map(userGroup => `/topic/chat#${userGroup.userGroupId}`).includes(destination)) {
              this.subscriptions = this.subscriptions.filter(e => e !== subscription);
              subscription.unsubscribe();
              this.subscriptionMap.delete(destination);
              console.log(`chat.component/ngOnInit/removed destination: ${destination}`);
            }
          });

          this.loadChats();
        }
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
    const chatRoom = this.getChatRoomByChat(chat);
    console.log(`chatRoom: ${JSON.stringify(chatRoom)}`);
    if (chatRoom) {
      // chatRoom.chats.push(chat); // not enough because UI is not updated...
      chatRoom.chats =  [...chatRoom.chats, chat]; // ...so the array must be recreated
    }
    this.message = '';
  }

  getUsersByUserGroup(userGroup: UserGroup): User[] {
    return userGroup.users ?? [];
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
    this.message == '';
  }

  onCloseTabView(event_: any): void {
    console.log(`chat.component/onCloseTabView/event: ${JSON.stringify(event_)}`);
    console.log(`chat.component/onCloseTabView/activeIndex: ${this.activeIndex}`);
    if (this.isChatRoomUser(this.getSelectedChatRoom()) && this.chatRooms.filter(e => this.isChatRoomUser(e)).length == 1) {
      const destination: string = `/queue/privatechat#${this.sessionService.getUser().userId}`;
      this.subscriptionMap.get(destination)?.unsubscribe();
      this.subscriptionMap.delete(destination);
      console.log(`chat.component/onCloseTabView/removed destination: ${destination}`);
    }

    this.chatRooms.splice(event_.index, 1); // remove closed chatRoom from its array
    this.activeIndex = 0;
  }

  onClickUser(user: User): void {
    console.log(`chat.component/onClickUser/user: ${JSON.stringify(user)}`);
    console.log(`chat.component/onClickUser/activeIndex: ${this.activeIndex}`);

    const destination: string = `/queue/privatechat#${this.sessionService.getUser().userId}`; 
    if (!this.subscriptionMap.has(destination)) {
      const subscription: Subscription = this.rxStompService.watch({ destination, subHeaders: { durable: "false", exclusive: "false", 'auto-delete': "true" } } as IWatchParams).subscribe(
        (message: Message) => {
          console.log(`chat.component/onClickUser/message received: ${JSON.stringify(message)}`);
          const chat: Chat = JSON.parse(message.body);
          this.processChat(chat);
        }
      );
      this.subscriptions.push(subscription);
      this.subscriptionMap.set(destination, subscription);
      console.log(`chat.component/onClickUser/added destination: ${destination}`);
    }

    this.loadPrivateChats(user);
  }

  getSelectedChatRoom(): ChatRoom {
    return this.chatRooms[this.activeIndex];
  }

  getChatRoomByChat(chat: Chat): ChatRoom | undefined {
    const chatRooms: ChatRoom[] = this.chatRooms.filter(e => this.isChatRoomUserGroup(e) && e.userGroup?.userGroupId === chat.userGroup?.userGroupId ||
      this.isChatRoomUser(e) && e.user?.userId === (chat.user?.userId === this.sessionService.getUser().userId ? chat.targetUser?.userId : chat.user?.userId));
      return chatRooms.length === 0 ? undefined : chatRooms[0];
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
    else if (this.isChatRoomUser(chatRoom)) {
      chat.targetUser = chatRoom.user;
    }

    this.sendChat(chat);
  }

  sendChat(chat: Chat): void {
    console.log(`chat.component/sendChat`);
    this.apiService.post<GenericResponse<Chat>>(ApiEndpoints.CHATS.SEND_CHAT, chat)
    .subscribe({
      next: value => {
        console.log(`chat.component/sendChat/next`);
        const updatedChat: Chat = value.data;
        if (chat.targetUser) { // private chat
          this.processChat(updatedChat);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(`chat.component/sendChat/err: ${JSON.stringify(err)}`);
      },
      complete: () => {
        console.log('chat.component/sendChat/complete');
      }
    });

  }

  loadPrivateChats(targetUser: User): void {
    if (this.chatRooms.findIndex(e => this.isChatRoomUser(e) && e.user?.userId === targetUser.userId) >= 0 || this.sessionService.getUser().userId === targetUser.userId) {
      return;
    }
    this.apiService.get<GenericListResponse<Chat>>(`${ApiEndpoints.CHATS.RETRIEVE_PRIVATE_CHATS}?sourceUserId=${this.sessionService.getUser().userId}&targetUserId=${targetUser.userId}`).subscribe(
      (value) => {
        this.chatRooms.push({chats: value.data, user: targetUser} as ChatRoom);
        console.log(`chat.component/loadPrivateChats/chat: ${JSON.stringify(value.data)}`);
        setTimeout(() => { // without setTimeout UI would not change to the new tab
          this.activeIndex = this.chatRooms.length-1;
        }, 0);
        console.log(`chat.component/loadPrivateChats/activeIndex: ${this.activeIndex}`);
      }
    );
  }
}
