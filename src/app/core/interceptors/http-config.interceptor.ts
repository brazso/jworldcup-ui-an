import { Injectable, Injector } from '@angular/core';
import {
	HttpInterceptor,
	HttpRequest,
	HttpResponse,
	HttpHandler,
	HttpEvent,
	HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError, of, pipe } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthorityService } from 'src/app/core/services/authority.service';
import { MessageService } from 'primeng/api';
import { TranslocoService } from '@ngneat/transloco';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { default as RouterUrls} from 'src/app/core/constants/router-urls.json';
import { default as MessageConstants } from 'src/app/core/constants/message-constants.json';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {

	constructor(
		private authService: AuthorityService,
		private loader: LoaderService,
		private messageService: MessageService,
		private translocoService: TranslocoService,
		private modal: ModalService,
		private router: Router
	) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		this.showLoader();

		// request = request.clone({ headers: request.headers.set('X-Requested-With', 'XMLHttpRequest') });
		if (this.authService.token) {
			request = request.clone({
				setHeaders: {
					Authorization: `${MessageConstants.BEARER} ${this.authService.token}`
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
			map((event: HttpEvent<any>) => {
				if (event instanceof HttpResponse) {
					console.log('event--->>>', event);
					this.onEnd();
				}
				return event;
			}),
			catchError((error: HttpErrorResponse, caught) => {
				console.log('error--->>>', error);
				this.onEnd();
				this.modal.closeAll();
				if (error.status === 401) {
					// Unauthorized, go to login
					console.log('hello');
					this.authService.unauthenticate()
					this.router.navigate([RouterUrls.LOGIN]);
				}
				if (error.status === 403) {
					// Forbidden, go to error
					this.router.navigate([RouterUrls.FORBIDDEN]);
				}
				if (error.status === 504) {
					// Gateway timeout, server unavailable
					this.router.navigate([RouterUrls.SERVICE_UNAVAILABLE]);
				}
				// Modal service can show a popup here
				if (error.error.userMessage) {
					this.translocoService.selectTranslate('GLOBAL.HIBA').subscribe((res: string) => {
						const msg = {
							severity: 'warn',
							summary: res,
							detail: error.error.userMessage,
							life: 10000
						};
						this.messageService.add(msg);
					});
				}

				return throwError(error);
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