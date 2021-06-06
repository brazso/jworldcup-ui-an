import { PipeTransform, Pipe } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';

/**
 * Similar to DatePipe, however if the locale parameter is not given explicitly
 * then it comes from TranslocoService
 */
@Pipe({ name: 'dynamicDate', pure: true })
export class DynamicDatePipe implements PipeTransform {
	constructor(
		private datePipe: DatePipe,
		private translocoService: TranslocoService) { }

	transform(value: any, format = 'shortDate', timezone?: string, locale?: string): string | null {
		if (locale === undefined) {
			locale = this.translocoService.getActiveLang();
		}
		return this.datePipe.transform(value, format, timezone, locale);
	}
}

