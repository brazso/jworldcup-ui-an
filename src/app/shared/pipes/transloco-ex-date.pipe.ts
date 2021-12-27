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
		// private translocoService: TranslocoService
        ) { }

	// transform(value: any, format = 'shortDate', timezone?: string, locale?: string): string | null {
	// 	if (timezone === undefined && this.sessionService.isAuthenticated()) {
	// 		timezone = this.sessionService.getUser().zoneId;
	// 	}
	// 	// if (locale === undefined) {
	// 	// 	locale = this.translocoService.getActiveLang();
	// 	// }
	// 	return this.translocoDatePipe.transform(value, format, timezone, locale);
	// }

    transform(date: ValidDate, options: DateFormatOptions = {}, locale?: Locale) {
		// console.log(`transform date: ${JSON.stringify(date)}, options: ${JSON.stringify(options)}, locale: ${JSON.stringify(locale)}`);
		if (options?.timeZone === undefined && this.sessionService.isAuthenticated()) {
				options.timeZone = this.sessionService.getUser().zoneId;
		}
		// console.log(`transform2 date: ${JSON.stringify(date)}, options: ${JSON.stringify(options)}, locale: ${JSON.stringify(locale)}`);
        return this.translocoDatePipe.transform(date, options);
      }
}

