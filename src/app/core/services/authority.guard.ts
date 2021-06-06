import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { ToastMessageService, ToastMessageSeverity } from 'src/app/shared/services/toast-message.service';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class AuthorityGuard implements CanActivate {
  rolesAllowed: string[] = [];

  constructor(
    private readonly userServiceService: UserService,
    // private readonly toastMessageService: ToastMessageService,
    private readonly translocoService: TranslocoService
    ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const roles: Array<string> = route.data.rolesAllowed /*as Array<string>*/;
    let v = roles ? roles.some(role => this.userServiceService.isUserInRole(role)) : false;
    if (!v) {
      // this.toastMessageService.displayMessage(ToastMessageSeverity.ERROR, 'no-permission.view-page');
    }
    return of(v);
  }
}
