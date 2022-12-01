import { Injectable } from '@angular/core';
import { JwtResponse } from '../models';
import { ApiService } from './api.service';
import { map, Observable, Subscription } from 'rxjs';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';

@Injectable({
  providedIn: 'root'
})
@Injectable()
export class JwtService {

  constructor(
    private apiService: ApiService
  ) {
  }

  getToken(): string {
    return window.localStorage['jwtToken'];
  }

  saveToken(token: string): void {
    window.localStorage['jwtToken'] = token;
  }

  destroyToken(): void {
    window.localStorage.removeItem('jwtToken');
  }

  refreshToken(): Observable<JwtResponse> {
    console.log('jwt.service/refreshToken');
    return this.apiService.post<JwtResponse>(ApiEndpoints.REFRESH)
      .pipe(map(
        response => {
          if (response.token) {
            this.saveToken(response.token); // store new access token
          }
          return response;
        }
      ));
  }
}
