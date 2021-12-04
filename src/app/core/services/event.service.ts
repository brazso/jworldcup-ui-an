import { Injectable } from '@angular/core';
import { User } from 'src/app/core/models/user/user.model';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
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
export class EventService {
  private eventSubject = new BehaviorSubject<Event>({} as Event);
  event: Observable<Event> = this.eventSubject.asObservable();

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly apiService: ApiService,
    private router: Router
  ) {
  }

  initEventByUser(user: User): Observable<Event> {
    console.log(`user: ${JSON.stringify(user)}`);
    if (!user) {
        return of({} as Event);
    }
    return this.apiService.get<Event>(ApiEndpoints.EVENTS.FIND_EVENT_BY_USER+`?userId=${user.userId}`)
    .pipe(map(event => {
      this.setEvent(event);
      return event;
    }));
  }

  getEvent(): Event {
    return this.eventSubject.value;
  }

  setEvent(event: Event): void {
    this.eventSubject.next(event);
  }

}
