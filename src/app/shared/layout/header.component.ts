import { Component, OnInit } from '@angular/core';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { MenuItem } from 'primeng/api';

import { Event, User, SessionService, ApiService, GenericListResponse, SessionData } from 'src/app/core';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { isObjectEmpty } from '../utils';

import RouterUrls from 'src/app/core/constants/router-urls.json';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(
    private translocoService: TranslocoService,
    private sessionService: SessionService,
    private apiService: ApiService
  ) {}

  session: SessionData = {};
  user: User = {};
  event: Event = {};
  menuItems: MenuItem[];
  events: Event[] = [];

  // session fields
  // eventCompletionPercent: number | undefined;
  // newsLine: string;
  

  ngOnInit(): void {
    this.sessionService.session.subscribe(
      (session: SessionData) => {
        this.session = session;
        console.log(`session: ${JSON.stringify(session)}`);
      }
    );    
    this.sessionService.user.subscribe(
      (user: User) => {
        this.user = user;
        console.log(`user: ${JSON.stringify(user)}`);
        this.setupMenuItemsAfterTranlationLoaded();
        this.setupAllEvents();
      }
    );
    this.sessionService.event.subscribe(
      (event: Event) => {
        this.event = event;
        console.log(`event: ${JSON.stringify(event)}`);
        this.setupMenuItemsAfterTranlationLoaded();
      }
    );

    this.setupMenuItemsAfterTranlationLoaded();
  }

  private setupMenuItemsAfterTranlationLoaded() : void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      this.setupMenuItems();
    });    
  }

  private setupMenuItems(): void {
    console.log('setupMenuItems');
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
            disabled: true
          },
          {
            label: this.translocoService.translate('menu.point_race'),
            disabled: true
          },
          {
            label: this.translocoService.translate('menu.certificate'),
            visible: this.sessionService.isUserUser() /* TODO and applicationBean.eventFinished */,
            disabled: true
          },
          {
            label: this.translocoService.translate('menu.topUsers'),
            visible: this.sessionService.isUserUser() /* TODO and not empty applicationBean.completedEventIds */,
            disabled: true
          },
          {
            label: this.translocoService.translate('menu.chat'),
            visible: this.sessionService.isUserUser(),
            disabled: true
          },
          {
            label: this.translocoService.translate('menu.gameRule'),
            disabled: true
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
            disabled: true
          }
        ]
      },
      {
        label: this.translocoService.translate('menu.settings'),
        items: [
          {
            label: this.translocoService.translate('menu.modify_user'),
            disabled: true
          },
          {
            label: this.translocoService.translate('menu.user_groups'),
            disabled: true
          }
        ]
      },
      {
        label: this.translocoService.translate('menu.namecard'),
        disabled: true
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
    console.log('onEventChange');
    // const event: Event = event_.value;
    
    this.sessionService.getSession().event = this.event;

    // eventCompletionPercent must be refreshed
    this.sessionService.initSession().subscribe();
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

}
