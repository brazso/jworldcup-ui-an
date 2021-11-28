import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { GenericResponse } from './core/models/common';
import { User } from './core/models/user/user.model';
import { BackendService } from './core/services/backend.service';
import { UserService } from './core/services/user.service';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import pkg from 'package.json';

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
  frontendVersion: string;
  backendVersion: string;

  constructor(
    private readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly backendService: BackendService,
    private readonly userService: UserService,
    // private readonly enumService: EnumService,
    // private readonly toastMessageService: ToastMessageService
    ) {
  }

  ngOnInit(): void {
    // after the translation was being loaded start app initialization
    this.translocoService.selectTranslation().subscribe((translation: Translation) => {
      this.setupFrontendBackendVersions();
      this.loadAndStoreUser();
    });
  }

  title = 'jworldcup-ui-an';

  private setupFrontendBackendVersions(): void {
    this.frontendVersion = pkg.version;
    this.backendService.getBackendVersion().subscribe({
      next: (v: GenericResponse<string>) => {
        this.backendVersion = v.data as string;
      },
      error: (e) => {
        // this.toastMessageService.displayMessage(ToastMessageSeverity.ERROR, this.translocoService.translate('backend_version_load_failed'));
      }
    });
  }

  private loadAndStoreUser(): void {
    this.userService.loadAndStoreUser().subscribe({
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

  logout() {
    this.userService.logout();
  }
}
