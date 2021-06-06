import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { Observable } from 'rxjs';
import { GenericResponse } from 'src/app/core/models/common';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private readonly apiService: ApiService) {
  }

  getBackendVersion(): Observable<GenericResponse<string>> {
    console.log('getBackendVersion');
    return this.apiService.get<GenericResponse<string>>(ApiEndpoints.BACKEND_VERSION);
  }

}
