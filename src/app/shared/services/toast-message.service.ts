import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslocoService } from '@ngneat/transloco';

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

	constructor(
		private messageService: MessageService,
		private translocoService: TranslocoService) { }

	displayMessage(severity: ToastMessageSeverity, detailKey: string, life: number = 10000): void {
		this.translocoService.translateObject('GLOBAL.SEVERITY.' + severity.toUpperCase()).subscribe((summary: string) => {
			this.translocoService.translateObject(detailKey).subscribe((detail: string) => {
				const msg = {
					severity: severity.toLowerCase(),
					summary: summary + '!',
					detail: detail,
					life: life
				};
				this.messageService.add(msg);
			});
		});
	}
}
