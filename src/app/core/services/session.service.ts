import { Injectable } from '@angular/core';
import { Event, JwtRequest, JwtResponse, SessionData, User } from 'src/app/core/models';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ApiService, JwtService, RxStompService } from 'src/app/core/services';
import { TranslocoService } from '@ngneat/transloco';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { Router } from '@angular/router';
import { GenericResponse } from '../models/common';
import { isObjectEmpty } from 'src/app/shared/utils';
import equal from 'fast-deep-equal';
import { IRxStompPublishParams, IWatchParams } from '@stomp/rx-stomp';
import { Message } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionSubject = new BehaviorSubject<SessionData>({} as SessionData);
  session: Observable<SessionData> = this.sessionSubject.asObservable();
  
  private userSubject = new BehaviorSubject<User>({} as User);
  user: Observable<User> = this.userSubject.asObservable();

  private eventSubject = new BehaviorSubject<Event>({} as Event);
  event: Observable<Event> = this.eventSubject.asObservable();

  private sessionSubscriptionMap: Map<string, Subscription> = new Map(); // K: session-id

  constructor(
    private jwtService: JwtService,
    private translocoService: TranslocoService,
    private apiService: ApiService,
    private rxStompService: RxStompService,
    private router: Router
  ) {
  }

  getSession(): SessionData {
    return this.sessionSubject.value;
  }

  setSession(session: SessionData): void {
    this.sessionSubject.next(session);
  }

  initSession(): Observable<SessionData> {
    console.log('initSession');
    this.getSession().localeId = this.translocoService.getActiveLang();
    return this.apiService.put<GenericResponse<SessionData>>(ApiEndpoints.SESSION.SESSION_DATA, this.getSession())
      .pipe(map(response => {
        if (response.data.user) {
          this.setUser(response.data.user);
        }
        if (response.data.event) {
          this.setEvent(response.data.event);
        }
        this.setSession(response.data);

        if (!isObjectEmpty(this.getSession())) {
          if (this.getSession().id) {
            console.log(`watch: /queue/session${this.getSession().id}`);
            // this.rxStompService.publish({ destination: '/topic/demo', body: 'Hello Demo!' } as IRxStompPublishParams);
            // this.rxStompService.watch({ destination: '/topic/user-session/' + response.data.id } as IWatchParams);

            const subscription = this.rxStompService.watch({ destination: `/queue/session${this.getSession().id}`, subHeaders: { durable: "false", exclusive: "false", 'auto-delete': "true" } } as IWatchParams).subscribe(
              (message: Message) => {
                // console.log(`message received: ${JSON.stringify(message)}`);
                const session: SessionData = JSON.parse(message.body);
                console.log(`session received: ${JSON.stringify(session)}`);
              }
            );
            this.sessionSubscriptionMap.set(this.getSession().id!, subscription);
          }
        }

        return response.data;
    }));
  }

  private destroySession(): void {
    console.log('destroySession');
    this.destroyUser();
    this.destroyEvent();

    delete this.getSession().localeId;
    if (!isObjectEmpty(this.getSession())) {
      if (this.getSession().id) {
        this.sessionSubscriptionMap?.get(this.getSession().id!)?.unsubscribe();
        this.sessionSubscriptionMap?.delete(this.getSession().id!);
      }
      console.log('emptySession');
      this.setSession({} as SessionData);
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
          // console.log('destroySession3');
          // this.destroySession();
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
    if (!equal(this.getUser(), user)) {
      this.userSubject.next(user);
    }
  }

  destroyUser(): void {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();

    if (!isObjectEmpty(this.getUser())) {
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
   * @param role role to be checked, e.g. ROLE_USER
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

  attemptAuth(type: string, credentials: JwtRequest): Observable<SessionData> {
    console.log('attemptAuth');
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
    if (!equal(this.getEvent(), event)) {
      this.eventSubject.next(event);
    }
  }

  destroyEvent(): void {
    if (!isObjectEmpty(this.getEvent())) {
      this.setEvent({} as Event);
    }
  }

  goToDefaultPage(): void {
    if (this.isUserInRole('ROLE_ADMIN')) {
      this.router.navigate([RouterUrls.HOME_PAGE]);
    } else if (this.isUserInRole('ROLE_USER')) {
      this.router.navigate([RouterUrls.HOME_PAGE]);
    }
  }
}
