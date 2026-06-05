import { PipeTransform, Pipe, Injectable } from '@angular/core';
import { DateFormatOptions, Locale, TranslocoLocaleService, ValidDate } from '@jsverse/transloco-locale';
import { SessionService } from 'src/app/core/services';

/**
 * Similar to TranslocoDatePipe, however if the timeZone parameter is not given 
 * explicitly then it comes from the actual user's setting of SessionService
 * 
 * TranslocoDatePipe cannot be injected because inner ChangeDetectorRef cannot be 
 * injected and throws "No provider for ChangeDetectorRef" error.
 */
@Injectable()
@Pipe({
    name: 'translocoExDate', pure: true,
    standalone: false
})
export class TranslocoExDatePipe implements PipeTransform {
	constructor(
		private translocoLocaleService: TranslocoLocaleService,
		private sessionService: SessionService
	) { }

	transform(date: ValidDate, options: DateFormatOptions = {}, locale?: Locale) {
		// console.log(`transloco-ex-date.pipe/transform date: ${JSON.stringify(date)}, options: ${JSON.stringify(options)}, locale: ${JSON.stringify(locale)}`);
		if (options?.timeZone === undefined && this.sessionService.isAuthenticated()) {
			// console.log(`transloco-ex-date.pipe/transform/options.timeZone: ${this.sessionService.getUser().zoneId}`);
			options.timeZone = this.sessionService.getUser().zoneId;
		}
		// console.log(`transloco-ex-date.pipe/transform date2: ${JSON.stringify(date)}, options: ${JSON.stringify(options)}, locale: ${JSON.stringify(locale)}`);
		return this.translocoLocaleService.localizeDate(date, locale, options);
      }
}

