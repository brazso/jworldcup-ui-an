import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SessionService } from 'src/app/core/services';
import { ToastMessageService, ToastMessageSeverity } from 'src/app/shared/services';

@Injectable({
  providedIn: 'root'
})
export class AuthorityGuard implements CanActivate {

  constructor(
    private sessionService: SessionService,
    private toastMessageService: ToastMessageService,
    // private translocoService: TranslocoService
    ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('canActivate');
    const roles: Array<string> = route.data.rolesAllowed /*as Array<string>*/;
    console.log(`roles: ${JSON.stringify(roles)}`);
    let v = roles ? roles.some(role => this.sessionService.isUserInRole(role)) : false;
    if (!v) {
      this.toastMessageService.displayMessage(ToastMessageSeverity.ERROR, 'no-permission.view-page');
    }
    return of(v);
  }
}
