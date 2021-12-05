import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { User } from './core/models/user/user.model';
import { UserService } from './core/services/user.service';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // public version: string = version;
  // navLinks: MenuElemek[];
  // public navFelhasznalo: string;
  // public navFelhasznaloTaszSzam: string;

  constructor(
    private readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly userService: UserService,
    // private readonly enumService: EnumService,
    // private readonly toastMessageService: ToastMessageService
    ) {
  }

  ngOnInit(): void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      this.setupUser();
    });
  }

  title = 'jworldcup-ui-an';

  private setupUser(): void {
    this.userService.initUser().subscribe({
      next: (user: User) => {
        console.log('user=' + user.loginName);
        this.goToDefaultPage();
      },
      error: (err) => {
        console.log('not authenticated yet');
      }
    });
  }

  private goToDefaultPage(): void {
    if (this.userService.isUserInRole('ROLE_ADMIN')) {
      this.router.navigate([RouterUrls.HOME_PAGE]);
    } else if (this.userService.isUserInRole('ROLE_USER')) {
      this.router.navigate([RouterUrls.HOME_PAGE]);
    }
  }
}
