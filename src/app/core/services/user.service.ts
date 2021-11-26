import { Injectable } from '@angular/core';
import { User } from 'src/app/core/models/user/user.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { TranslocoService } from '@ngneat/transloco';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User>({} as User);
  public user: Observable<User> = this.userSubject.asObservable();

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly apiService: ApiService
  ) {
  }

  private loadUser(): Observable<User> {
    try {
      let lang: string = this.translocoService.getActiveLang();
      console.log('lang='+lang);
      let msg: string = this.translocoService.translate("SZOLGALTATAS_NEM_ELERHETO");
      console.log('msg='+msg);
      return this.apiService.get<User>(ApiEndpoints.USERS.WHOAMI);
    } catch (error) {
      throw new Error(this.translocoService.translate("SZOLGALTATAS_NEM_ELERHETO"));
    }
  }

  loadAndStoreUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      this.loadUser().subscribe(
        res => {
          this.userSubject.next(res);
          resolve(res);
        },
        err => {
          if (err.url) {
            // console.log('forward to login', err.url);
            // window.location.href = err.url;
          } else {
            console.log('Rolls further the error from user service', err);
            throw new Error(err);
          }
          reject(err);
        }
      );
    });
  }

  getUser(): User {
    return this.userSubject.value;
  }

  getAuthorities(): string[] {
    return this.getUser().authorities!;
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  /**
	 * Checks if the autheticated user has the given role
	 * Returns false if there is no authenticated user.
	 * @param role role to be checked, e.g. "felh_karbantartas"
	 */
	isUserInRole(role: string): boolean {
    return this.getAuthorities()?.includes(role) ?? false;
  }

  isUserAdmin(): boolean {
    return this.isUserInRole('ROLE_ADMIN');
  }

  isUserUser(): boolean {
    return this.isUserInRole('ROLE_USER');
  }

  public logout() {
    window.location.href = `${location.origin}${ApiEndpoints.LOGOUT}`;
  }
}
