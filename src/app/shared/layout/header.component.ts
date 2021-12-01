import { Component, OnInit } from '@angular/core';

import { User, UserService } from '../../core';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  constructor(
    private userService: UserService
  ) {}

  currentUser: User;

  ngOnInit(): void {
    this.userService.user.subscribe(
      (user: User) => {
        this.currentUser = user;
      }
    );
  }

  logout() {
    this.userService.logout();
  }
}
