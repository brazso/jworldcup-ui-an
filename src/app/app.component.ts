import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { GenericResponse } from './core/models/common';
import { User } from './core/models/user/user.model';
import { BackendService } from './core/services/backend.service';
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
    let msg: string = this.translocoService.translate("SZOLGALTATAS_NEM_ELERHETO");
    console.log('msg0='+msg);
    this.translocoService.selectTranslate('SZOLGALTATAS_NEM_ELERHETO').subscribe((msg: string) => {
      console.log('msg1='+msg);
    });
    this.loadAndStoreUser();
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

  private loadAndStoreUser(): void {
    this.userService.loadAndStoreUser().
      then(
        (user: User) => {
          console.log('user=' + user.loginName);
          this.goToDefaultPage();
        }
      ).catch((err) => {
        console.log('not authenticated yet');
      });
  }

  private goToDefaultPage(): void {
    if (this.userService.isUserInRole('ROLE_ADMIN')) {
      this.router.navigate([RouterUrls.HOME_PAGE]);
    } else if (this.userService.isUserInRole('ROLE_USER')) {
      this.router.navigate([RouterUrls.HOME_PAGE]);
    }
  }

  public logout() {
    this.userService.logout();
  }
}
