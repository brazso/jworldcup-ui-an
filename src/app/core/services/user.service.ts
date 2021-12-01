import { Injectable } from '@angular/core';
import { User } from 'src/app/core/models/user/user.model';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ApiService, JwtService } from 'src/app/core/services';
import { TranslocoService } from '@ngneat/transloco';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { JwtRequest } from 'src/app/core/models/user/jwtRequest.model';
import { JwtResponse } from '..';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User>({} as User);
  user: Observable<User> = this.userSubject.asObservable();

  constructor(
    private readonly jwtService: JwtService,
    private readonly translocoService: TranslocoService,
    private readonly apiService: ApiService,
    private router: Router
  ) {
  }

  setupUser(): Observable<User> {
    // try {
      return this.apiService.get<User>(ApiEndpoints.USERS.WHOAMI)
      .pipe(map(user => {
        this.authenticate(user);
        return user;
      }));
    // } catch (error) {
    //   throw new Error(this.translocoService.translate("SZOLGALTATAS_NEM_ELERHETO"));
    // }
  }

  authenticate(user: User, token?: string) {
    // Save JWT sent from server in localstorage
    if (token) {
      this.jwtService.saveToken(token);
    }
    // Set current user data into observable
    this.userSubject.next(user);
  }

  unauthenticate(): void {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    if (this.isAuthenticated()) {
      this.userSubject.next({} as User);
    }
  }

  attemptAuth(type: string, credentials: JwtRequest): Observable<User> {
    // const route = (type === 'login') ? '/login' : '';
    return this.apiService.post<JwtResponse>('/login', credentials)
      .pipe(map(
        response => {
          if (response.token) {
            this.jwtService.saveToken(response.token);
          }
          // this.authenticate(data.user);
          return response;
        }
      )).pipe(mergeMap(
        response => { 
          return this.setupUser();
        }
      ));
  }

  logout(): void {
    console.log('logout');
 		this.apiService.post<void>(ApiEndpoints.LOGOUT)
			.subscribe({
				next: response => {
          console.log('unauthenticate1');
					this.unauthenticate();
				},
				error: error => {
          console.log('unauthenticate2');
					this.unauthenticate();
				},
				complete: () => {
          console.log('unauthenticate3');
					this.unauthenticate();
					// Get a new JWT token
          this.router.navigateByUrl('/login');
				}
			});
	}

  getUser(): User {
    return this.userSubject.value;
  }

  getAuthorities(): string[] {
    return this.getUser().authorities!;
  }

  isAuthenticated(): boolean {
    // return !!this.getUser();
    return Object.keys(this.getUser()).length !== 0; // object is not empty?
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
}
