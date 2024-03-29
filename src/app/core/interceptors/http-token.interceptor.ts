import { Injectable, OnDestroy } from '@angular/core';
import {
	HttpInterceptor,
	HttpRequest,
	HttpResponse,
	HttpHandler,
	HttpEvent,
	HttpErrorResponse
} from '@angular/common/http';

import { Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { default as MessageConstants } from 'src/app/core/constants/message-constants.json';
import { JwtService, SessionService } from 'src/app/core/services';
import { ToastMessageService, ToastMessageSeverity } from 'src/app/shared/services';
import { environment } from 'src/environments/environment';
import { getApiErrorOverallType, isApiError } from '../models';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

	private isRefreshToken: boolean = false;
    private tokenSubject: Subject<boolean> = new Subject<boolean>(); // subject type is irrelevant here

	constructor(
		private jwtService: JwtService,
		private sessionService: SessionService,
		private loader: LoaderService,
		private toastMessageService: ToastMessageService,
		private modal: ModalService,
		private router: Router
	) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		this.showLoader();

		request = this.addTokenToRequest(request);
		
		/*
			HTTP Status Codes
			200 - if the request is processed successfully.
			500 - if the problem is the server's fault.
			400 - if the request is the client's fault.
			401 - if the user needs to log in
			403 - it the user is logged in but does not have permission
			404 - if the resource does not exist

			HTTP status code
			API specific error code
			User message
			Developer message
			Validation messages
		*/

		return next.handle(request).pipe(
			tap((event: HttpEvent<any>) => {
				if (event instanceof HttpResponse) {
					console.log('http-token.interceptor/event--->>>', event);
					this.onEnd();
				}
			}),
			catchError((error: HttpErrorResponse, caught) => {
				console.log('http-token.interceptor/error--->>>', JSON.stringify(error));
				this.onEnd();
				this.modal.closeAll();
				if (error.status === 401) {
					// Unauthorized(, go to logout)
					if (!this.isRefreshToken) { // ...and not refresh api has been called
						return this.handle401Error(request, next);
					}
				}
				if (error.status === 403) {
					// Forbidden, go to error
					this.router.navigate([RouterUrls.FORBIDDEN]);
				}
				if (error.status === 504) {
					// Gateway timeout, server unavailable
					this.router.navigate([RouterUrls.SERVICE_UNAVAILABLE]);
				}

				if (error.status >= 500) {
					if (!environment.production && (error.status !== 500 || !isApiError(error.error))) { // apiError should not be displayed
						let msg = error.error?.message ?? error.message;
						this.toastMessageService.displayNativeMessage(ToastMessageSeverity.WARN, msg);
					}
				}

				return throwError(() => error);
			}));
	}

	private addTokenToRequest(request: HttpRequest<any>): HttpRequest<any> {
		if (this.jwtService.getToken()) {
			request = request.clone({
				setHeaders: {
					Authorization: `${MessageConstants.BEARER} ${this.jwtService.getToken()}`
			  	}
			})
		}
		return request;
	}

	private onEnd(): void {
		this.hideLoader();
	}

	private showLoader(): void {
		this.loader.show();
	}
	
	private hideLoader(): void {
		this.loader.hide();
	}

	private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		console.log('http-token.interceptor/handle401Error');
		this.requestRefreshToken();
		return this.tokenSubject.pipe(
			take(1),
			switchMap(token => {
				request = this.addTokenToRequest(request); // add new access token to request header...
				return next.handle(request); // ... and repeat previous request
			})
		);
	}

	private requestRefreshToken() {
		console.log('http-token.interceptor/requestRefreshToken');
		this.isRefreshToken = true;
		this.jwtService.refreshToken().subscribe({
			next: jwtResponse => {
				console.log('http-token.interceptor/requestRefreshToken/refreshToken/next');
				if (jwtResponse.token) {
					this.tokenSubject.next(true);
				}
				this.isRefreshToken = false;
			},
			error: (err: HttpErrorResponse) => {
				console.log(`http-token.interceptor/requestRefreshToken/refreshToken/err: err=${JSON.stringify(err)}`);
				this.sessionService.logout();
				this.isRefreshToken = false;
			}
		});
	}

}
