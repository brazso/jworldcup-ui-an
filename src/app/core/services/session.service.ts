import { Injectable } from '@angular/core';
import { Event, JwtRequest, JwtResponse, SessionInfo, User } from 'src/app/core/models';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ApiService, JwtService } from 'src/app/core/services';
import { TranslocoService } from '@ngneat/transloco';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { Router } from '@angular/router';
import { GenericResponse } from '../models/common';
import { isObjectEmpty } from 'src/app/shared/utils';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionSubject = new BehaviorSubject<SessionInfo>({} as SessionInfo);
  session: Observable<SessionInfo> = this.sessionSubject.asObservable();
  
  private userSubject = new BehaviorSubject<User>({} as User);
  user: Observable<User> = this.userSubject.asObservable();

  private eventSubject = new BehaviorSubject<Event>({} as Event);
  event: Observable<Event> = this.eventSubject.asObservable();

  constructor(
    private jwtService: JwtService,
    // private translocoService: TranslocoService,
    private apiService: ApiService,
    private router: Router
  ) {
  }

  getSession(): SessionInfo {
    return this.sessionSubject.value;
  }

  setSession(session: SessionInfo): void {
    this.sessionSubject.next(session);
  }

  initSession(): Observable<SessionInfo> {
    return this.apiService.get<GenericResponse<SessionInfo>>(ApiEndpoints.SESSION.SESSION_INFO)
      .pipe(map(response => {
        if (response.data.user) {
          this.authenticate(response.data.user);
        }
        if (response.data.event) {
          this.setEvent(response.data.event);
        }
        this.setSession(response.data);
        return response.data;
    }));
  }

  destroySession() {
    this.unauthenticate();
    this.destroyEvent();
    if (!isObjectEmpty(this.getSession())) {
      this.setSession({} as SessionInfo);
    }
  }

  logout(): void {
    console.log('logout');
    this.apiService.post<void>(ApiEndpoints.LOGOUT)
      .subscribe({
        next: response => {
          console.log('destroySession1');
          this.destroySession();
        },
        error: error => {
          console.log('destroySession2');
          this.destroySession();
        },
        complete: () => {
          console.log('destroySession3');
          this.destroySession();
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
  }

  destroyUser(): void {
    if (!isObjectEmpty(this.getUser())) {
      this.setUser({} as User);
    }
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

  getAuthorities(): string[] {
    return this.getUser().authorities!;
  }

  isAuthenticated(): boolean {
    return !isObjectEmpty(this.getUser());
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

  attemptAuth(type: string, credentials: JwtRequest): Observable<SessionInfo> {
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
          return this.initSession();
        }
      ));
  }

  getEvent(): Event {
    return this.eventSubject.value;
  }

  setEvent(event: Event): void {
    this.eventSubject.next(event);
  }

  destroyEvent(): void {
    if (!isObjectEmpty(this.getEvent())) {
      this.setEvent({} as Event);
    }
  }

}
