import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslocoService } from '@ngneat/transloco';
import { of, forkJoin, combineLatest } from 'rxjs';

export enum ToastMessageSeverity {
	SUCCESS = 'success',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error'
}

@Injectable({
	providedIn: 'root'
})
export class ToastMessageService {
	life = 10000;

	constructor(
		private messageService: MessageService,
		private translocoService: TranslocoService) { }

	displayMessage(severity: ToastMessageSeverity, detailKey: string, life: number = this.life): void {

		// forkJoin cannot be used with selectTranslate because that observable doesn't complete
		combineLatest([
			this.translocoService.selectTranslate<string>('GLOBAL.SEVERITY.' + severity.toUpperCase()),
			this.translocoService.selectTranslate<string>(detailKey)
		  ]).subscribe(([summary, detail]) => {
			const msg = {
				severity: severity.toLowerCase(),
				summary: summary + '!',
				detail: detail,
				life: life
			};
			this.messageService.add(msg);
		  }
		);
	}

	displayNativeMessage(severity: ToastMessageSeverity, detail: string, life: number = this.life): void {
		this.translocoService.selectTranslate<string>('GLOBAL.SEVERITY.' + severity.toUpperCase()).subscribe((summary: string) => {
			const msg = {
				severity: severity.toLowerCase(),
				summary: summary + '!',
				detail: detail,
				life: life
			};
			this.messageService.add(msg);
		});
	}}
