import { PipeTransform, Pipe } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { SessionService } from 'src/app/core/services';
import { DateFormatOptions, TranslocoDatePipe, ValidDate, Locale } from '@ngneat/transloco-locale';

/**
 * Similar to DatePipe, however if the locale parameter is not given explicitly
 * then it comes from TranslocoService
 */
@Pipe({ name: 'translocoExDate', pure: true })
export class TranslocoExDatePipe implements PipeTransform {
	constructor(
		private translocoDatePipe: TranslocoDatePipe,
		private sessionService: SessionService,
        ) { }

    transform(date: ValidDate, options: DateFormatOptions = {}, locale?: Locale) {
		// console.log(`transloco-ex-date.pipe/transform date: ${JSON.stringify(date)}, options: ${JSON.stringify(options)}, locale: ${JSON.stringify(locale)}`);
		if (options?.timeZone === undefined && this.sessionService.isAuthenticated()) {
			// console.log(`transloco-ex-date.pipe/transform/options.timeZone: ${this.sessionService.getUser().zoneId}`);
			options.timeZone = this.sessionService.getUser().zoneId;
		}
		// console.log(`transloco-ex-date.pipe/transform date2: ${JSON.stringify(date)}, options: ${JSON.stringify(options)}, locale: ${JSON.stringify(locale)}`);
        return this.translocoDatePipe.transform(date, options);
      }
}

