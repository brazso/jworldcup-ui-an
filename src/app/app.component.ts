import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { GenericResponse } from './core/models/common';
import { User } from './core/models/user/user.model';
import { BackendService } from './core/services/backend.service';
import { ToastMessageService, ToastMessageSeverity } from './shared/services/toast-message.service';
import { UserService } from './core/services/user.service';

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
  public backendVersion: string;

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
    console.log('ngOnInit');
    let msg: string = this.translocoService.translate("SZOLGALTATAS_NEM_ELERHETO");
    console.log('msg0='+msg);

    // this.enumService.init();
    // this.setupMenuNavigationLinks();
    // this.setNavFelhasznalo();
    this.setupBackendVersionNumberText();
  }

  title = 'jworldcup-ui-an';

  private setupBackendVersionNumberText() {
    this.backendService.getBackendVersion().subscribe(
      (res: GenericResponse<string>) => {
        this.backendVersion = res.data as string;
      }, err => {
        // this.toastMessageService.displayMessage(ToastMessageSeverity.ERROR, this.translocoService.translate('backend_version_load_failed'));
      }
    );
  }

  // private setupMenuNavigationLinks() {
  //   this.userService.getVisibleMenuItems().subscribe(
  //     (res: GenericListResponse<MenuElemek>) => {
  //       const menuElemek = res.data;
  //       this.navLinks = menuElemek;
  //       this.navLinks.sort((a, b) => a.index - b.index);
  //     }, (err) => {
  //       {
  //         this.errorService.handle(err, 'Hiba a menüpontok betöltése során!');
  //       }
  //     });
  // }

  public setUser(): void {
    const user: User = this.userService.getUser();
    if (!user) {
      // this.toastMessageService.displayMessage(ToastMessageSeverity.ERROR, this.translocoService.translate('backend_version_load_failed'));
      throw Error('User is not set yet when app component starts!');
    }
    // this.setupPageParams(user);

    this.goToDefaultPage();
  }

  // private setupPageParams(user: User) {
  //   const fullName = user.. (navFelhasznalo.lastName ? navFelhasznalo.lastName : '');
  //   const firstName = (navFelhasznalo.firstName ? ` ${navFelhasznalo.firstName}` : '');
  //   const employeeNumber = (navFelhasznalo.employeeNumber ? ` (${navFelhasznalo.employeeNumber})` : '');

  //   this.navFelhasznalo = `${lastName}${firstName}${employeeNumber}`;
  //   this.navFelhasznaloTaszSzam = employeeNumber;
  // }

  private goToDefaultPage(): void {
    if (this.userService.isUserInRole('ROLE_ADMIN')) {
      this.router.navigate(['/admin-start-page']);
    } else if (this.userService.isUserInRole('ROLE_USER')) {
      this.router.navigate(['/user-start-page']);
    }
  }

  public logout() {
    this.userService.logout();
  }
}
