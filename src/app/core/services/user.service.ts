import { Injectable } from '@angular/core';
import { JwtRequest, JwtResponse, User } from 'src/app/core/models/user';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ApiService, EventService, JwtService } from 'src/app/core/services';
import { TranslocoService } from '@ngneat/transloco';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { Router } from '@angular/router';
import { GenericResponse } from '../models/common';

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
    private readonly eventService: EventService,
    private router: Router
  ) {
  }

  initUser(): Observable<User> {
    return this.apiService.get<GenericResponse<User>>(ApiEndpoints.USERS.WHOAMI)
      .pipe(map(response => {
        this.authenticate(response.data);
        return response.data;
      }));
  }

  authenticate(user: User, token?: string) {
    // Save JWT sent from server in localstorage
    if (token) {
      this.jwtService.saveToken(token);
    }
    // Set current user data into observable
    this.setUser(user);
  }

  unauthenticate(): void {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    if (this.isAuthenticated()) {
      this.setUser({} as User);
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
          return response;
        }
      )).pipe(mergeMap(
        response => { 
          return this.initUser();
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
          // this.router.navigateByUrl('/login');
          this.router.navigate([RouterUrls.LOGIN]);
				}
			});
	}

  getUser(): User {
    return this.userSubject.value;
  }

  setUser(user: User): void {
    this.userSubject.next(user);
    this.eventService.initEventByUser(user).subscribe();
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
