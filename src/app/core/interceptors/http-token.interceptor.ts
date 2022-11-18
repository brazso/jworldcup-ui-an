import { Injectable } from '@angular/core';
import {
	HttpInterceptor,
	HttpRequest,
	HttpResponse,
	HttpHandler,
	HttpEvent,
	HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { default as MessageConstants } from 'src/app/core/constants/message-constants.json';
import { JwtService, SessionService } from 'src/app/core/services';
import { ToastMessageService, ToastMessageSeverity } from 'src/app/shared/services';
import { environment } from 'src/environments/environment';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

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

		// request = request.clone({ headers: request.headers.set('X-Requested-With', 'XMLHttpRequest') });
		if (this.jwtService.getToken()) {
			request = request.clone({
				setHeaders: {
					Authorization: `${MessageConstants.BEARER} ${this.jwtService.getToken()}`
			  	}
			})
		}
		
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
					// Unauthorized, go to login if we are not at login yet
					this.sessionService.destroyUser();
					if (this.router.url.split('?')[0]  !== ('/'+RouterUrls.LOGIN)) {
						this.router.navigate([RouterUrls.LOGIN]);
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

				if (error.status >= 500 || !environment.production) {
					let msg = error.error?.message ?? error.message;
					this.toastMessageService.displayNativeMessage(ToastMessageSeverity.WARN, msg);
				}

				return throwError(() => error);
			}));
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
}
