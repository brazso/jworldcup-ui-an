import { Component, OnInit } from '@angular/core';

import { EventService, User, UserService } from '../../core';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  constructor(
    private userService: UserService,
    private eventService: EventService
  ) {}

  currentUser: User;
  currentEvent: Event;

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
  }

  logout() {
    this.userService.logout();
  }
}
