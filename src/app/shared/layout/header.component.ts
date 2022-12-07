import { Component, OnDestroy, OnInit } from '@angular/core';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { MenuItem } from 'primeng/api';

import { Event, User, SessionService, ApiService, GenericListResponse, SessionData, SessionDataModificationFlag } from 'src/app/core';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { isObjectEmpty } from '../utils';

import RouterUrls from 'src/app/core/constants/router-urls.json';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  session: SessionData = {};
  user: User = {};
  event: Event = {};
  menuItems: MenuItem[];
  events: Event[] = [];
  isNamecardDisplayed: boolean = false;
  isGameRuleDisplayed: boolean = false;

  constructor(
    private translocoService: TranslocoService,
    private sessionService: SessionService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.subscription.add(this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`header.component/ngOnInit/session: ${JSON.stringify(session)}`);
        this.setupMenuItemsAfterTranlationLoaded();
      }
    ));
    this.subscription.add(this.sessionService.user.subscribe(
      (user: User) => {
        this.user = user;
        console.log(`header.component/ngOnInit/user: ${JSON.stringify(user)}`);
        this.setupMenuItemsAfterTranlationLoaded();
        this.setupAllEvents();
      }
    ));
    this.subscription.add(this.sessionService.event.subscribe(
      (event: Event) => {
        this.event = event;
        console.log(`header.component/ngOnInit/event: ${JSON.stringify(event)}`);
        this.setupMenuItemsAfterTranlationLoaded();
      }
    ));

    this.setupMenuItemsAfterTranlationLoaded();
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  private setupMenuItemsAfterTranlationLoaded() : void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      this.setupMenuItems();
    });    
  }

  private setupMenuItems(): void {
    console.log('header.component/setupMenuItems');
    this.menuItems = [
      {
        label: this.translocoService.translate('menu.view'),
        items: [
          {
            label: this.translocoService.translate('menu.matches'),
            routerLink: [RouterUrls.MATCHES]
          },
          {
            label: this.translocoService.translate('menu.groups_standing'),
            routerLink: [RouterUrls.GROUP_STANDINGS]
          },
          {
            label: this.translocoService.translate('menu.point_race'),
            routerLink: [RouterUrls.SCORES]
          },
          {
            label: this.translocoService.translate('menu.certificate'),
            visible: this.sessionService.isUserUser() && this.sessionService.getSession().eventCompletionPercent === 100,
            routerLink: [RouterUrls.CERTIFICATES]
          },
          {
            label: this.translocoService.translate('menu.topUsers'),
            visible: this.sessionService.isUserUser() && (this.sessionService.getSession().completedEventIds?.length ?? 0) > 0,
            routerLink: [RouterUrls.TOP_USERS]
          },
          {
            label: this.translocoService.translate('menu.chat'),
            // visible: this.sessionService.isUserUser(),
            routerLink: [RouterUrls.CHAT]
          },
          {
            label: this.translocoService.translate('menu.gameRule'),
            command: (event) => {
              this.isGameRuleDisplayed = true;
            }
          }
        ]
      },
      {
        label: this.translocoService.translate('menu.bet'),
        visible: this.sessionService.isUserUser(),
        items: [
          {
            label: this.translocoService.translate('menu.bets'),
            routerLink: [RouterUrls.BETS]
          },
          {
            label: this.translocoService.translate('menu.favourite_team'),
            routerLink: [RouterUrls.FAVOURITE_TEAM]
          }
        ]
      },
      {
        label: this.translocoService.translate('menu.settings'),
        items: [
          {
            label: this.translocoService.translate('menu.modify_user'),
            routerLink: [RouterUrls.USER_DETAIL]
          },
          {
            label: this.translocoService.translate('menu.user_groups'),
            routerLink: [RouterUrls.USER_GROUPS]
          }
        ]
      },
      {
        label: this.translocoService.translate('menu.namecard'),
        command: (event) => {
          this.isNamecardDisplayed = true;
        }
      },
      {
        label: this.translocoService.translate('menu.logout'),
        icon: 'pi pi-sign-out', 
        command: (event) => {
          //event.originalEvent: Browser event
          //event.item: menuitem metadata
          this.logout();
        }
      }
    ];
  }

  private setupAllEvents() {
    if (isObjectEmpty(this.user)) {
      this.events = [];
      return;
    }

    this.apiService.get<GenericListResponse<Event>>(ApiEndpoints.EVENTS.FIND_ALL_EVENTS).subscribe(
      (value: GenericListResponse<Event>) => {
        this.events = value.data;
      }
    );
  }

  onEventChange(event_: any): void {
    console.log('header.component/onEventChange');
    // const event: Event = event_.value;

    // eventCompletionPercent must be refreshed
    this.sessionService.getSession().event = this.event;
    this.subscription.add(this.sessionService.initSession().subscribe());
  }

  logout() {
    this.sessionService.logout();
  }

  getLogoFileName(): string {
    let name = '/assets/images/jworldcup.png';
    if (this.event.eventId) {
      name = `/assets/images/logos/${this.event.shortDesc}${this.event.year}.png`;
    }
    return name;
  }

  onNameCardHide() {
    this.isNamecardDisplayed = false;
  }

  onGameRuleHide() {
    this.isGameRuleDisplayed = false;
  }
}
