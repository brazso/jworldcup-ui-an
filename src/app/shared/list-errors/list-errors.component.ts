import { Component, Input } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ApiErrorItem, apiErrorItemMsgFormat, isApiError, isApiErrorItem, UiError } from 'src/app/core/models';

@Component({
  selector: 'app-list-errors',
  templateUrl: './list-errors.component.html',
  styleUrls: ['./list-errors.component.scss']
})
export class ListErrorsComponent {
  formattedErrors: Array<string | ApiErrorItem> = [];
  isApiErrorItem = isApiErrorItem;

  constructor(
    private readonly translocoService: TranslocoService
  ) {
  }

  @Input()
  set errors(uiError: UiError) {
    this.formattedErrors = [];
    console.log(`list-errors.component/errors/uiError: ${JSON.stringify(uiError)}`);
    if (!uiError.isEmpty()) {
      let error = uiError.error;
      if (error && isApiError(error) && error.items) {
        this.formattedErrors = error.items.map(e => ({...e, msgBuilt: apiErrorItemMsgFormat(e, this.translocoService.translate(e.msgCode))}) as ApiErrorItem);
      }
      else if (uiError.status === 0) {
        this.translocoService.selectTranslate<string>('serviceNotAvailable').subscribe((res: string) => {
          this.formattedErrors.push(res);
        });
      }
      else {
        this.formattedErrors = Object.keys(uiError || {})
          .map(key => `${key} ${Object.assign(uiError)[key]}`);        
      }
    }
    console.log(`list-errors.component/errors/formattedErrors: ${JSON.stringify(this.formattedErrors)}`);
  }

  get errorList() { return this.formattedErrors; }

  classByMsgType(item: string | ApiErrorItem): string {
    let res = item as string;
    if (item && isApiErrorItem(item)) {
      res = 'msg-'+item.msgType.toLowerCase();
    }
    console.log(`list-errors.component/classByMsgType: res=${res}`);
    return res;
  }
}
