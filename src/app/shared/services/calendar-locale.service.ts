import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

// összes calendar locale importálandó a könyvtárból
import calendar_en from 'src/assets/i18n/calendar.en.json';
import calendar_hu from 'src/assets/i18n/calendar.hu.json';


@Injectable({
	providedIn: 'root'
})
export class CalendarLocaleService {
	private _calendarLocale: any;

	constructor(private translocoService: TranslocoService) {
		switch (this.translocoService.getActiveLang()) {
			case 'en':
				this._calendarLocale = calendar_en;
				break;
			case 'hu':
				this._calendarLocale = calendar_hu;
				break;
			default:
				this._calendarLocale = calendar_en;
		}
	}

	get calendarLocale() {
		return this._calendarLocale;
	}
}
