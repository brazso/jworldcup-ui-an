import { Injectable } from '@angular/core';
import { Event, GenericResponse, User } from 'src/app/core/models';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { ApiService } from 'src/app/core/services';
import { TranslocoService } from '@ngneat/transloco';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { Router } from '@angular/router';
import { isObjectEmpty } from 'src/app/shared/utils';

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
    if (isObjectEmpty(user)) {
        return of({} as Event);
    }
    return this.apiService.get<GenericResponse<Event>>(ApiEndpoints.EVENTS.FIND_EVENT_BY_USER+`?userId=${user.userId}`)
    .pipe(map(response => {
      this.setEvent(response.data);
      return response.data;
    }));
  }

  getEvent(): Event {
    return this.eventSubject.value;
  }

  setEvent(event: Event): void {
    this.eventSubject.next(event);
  }

  destroy(): void {
    this.setEvent({} as Event);
  }

}
