import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { default as MessageConstants } from 'src/app/core/constants/message-constants.json';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly basePath: string;
  private readonly defaultConfig: object;

  constructor(private readonly http: HttpClient) {
    this.basePath = environment.be_root;
    this.defaultConfig = ApiService.createDefaultConfiguration();
  }

  static createDefaultConfiguration() {
    return {
      headers: ApiService.initHeaders(),
      withCredentials: environment.with_credentials,
    };
  }

  static initHeaders() {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append(MessageConstants.CONTENT_TYPE, 'application/json;charset=UTF-8');
    return headers;
  }

  private mergeWithDefaultConfig(config?: object): object {
    if (config) {
      return {...this.defaultConfig, ...config};
    }
    return this.defaultConfig;
  }

  get<T>(url: string, config?: object): Observable<T> {
    const configuration = this.mergeWithDefaultConfig(config);
    return this.http.get<T>(this.basePath + url, configuration);
  }

  post<T>(url: string, body?: object, config?: object): Observable<T> {
    const configuration = this.mergeWithDefaultConfig(config);
    return this.http.post<T>(this.basePath + url, body, configuration);
  }

  patch<T>(url: string, body?: object, config?: object): Observable<T> {
    const configuration = this.mergeWithDefaultConfig(config);
    return this.http.patch<T>(this.basePath + url, body, configuration);
  }

  put<T>(url: string, body?: object, config?: object): Observable<T> {
    const configuration = this.mergeWithDefaultConfig(config);
    return this.http.put<T>(this.basePath + url, body, configuration);
  }

  delete<T>(url: string, config?: object): Observable<T> {
    const configuration = this.mergeWithDefaultConfig(config);
    return this.http.delete<T>(this.basePath + url, configuration);
  }

}
