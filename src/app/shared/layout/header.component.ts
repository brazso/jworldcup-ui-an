import { Component, OnInit } from '@angular/core';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { MenuItem } from 'primeng/api';

import { Event, EventService, User, UserService } from '../../core';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(
    private translocoService: TranslocoService,
    private userService: UserService,
    private eventService: EventService
  ) {}

  currentUser: User;
  currentEvent: Event;
  menuItems: MenuItem[];

  ngOnInit(): void {
    this.userService.user.subscribe(
      (user: User) => {
        this.currentUser = user;
        console.log(`currentUser: ${JSON.stringify(user)}`);
        this.eventService.initEventByUser(user).subscribe();
      }
    );
    this.eventService.event.subscribe(
      (event: Event) => {
        this.currentEvent = event;
        console.log(`currentEvent: ${JSON.stringify(event)}`);
      }
    );

    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      this.menuItems = [
        {
          label: this.translocoService.translate('menu.view'),
          items: [
            {
              label: this.translocoService.translate('menu.matches'),
              disabled: true
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
              disabled: true
            },
            {
              label: this.translocoService.translate('menu.topUsers'),
              disabled: true
            },
            {
              label: this.translocoService.translate('menu.chat'),
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
          visible: false,
          items: [
            {
              label: this.translocoService.translate('menu.bets'),
              disabled: true
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
    });
  }

  logout() {
    this.userService.logout();
    this.eventService.destroy();
  }

  getLogoFileName(): string {
    let name = '/assets/images/jworldcup.png';
    if (this.currentEvent.eventId) {
      name = `/assets/images/logos/${this.currentEvent.shortDesc}${this.currentEvent.year}.png`;
    }
    return name;
  }
}
