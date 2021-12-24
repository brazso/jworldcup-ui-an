import { Component, Input } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ApiErrorItem, isApiError, UiError } from 'src/app/core/models';

@Component({
  selector: 'app-list-errors',
  templateUrl: './list-errors.component.html',
  styleUrls: ['./list-errors.component.scss']
})
export class ListErrorsComponent {
  formattedErrors: Array<string> = [];

  constructor(
    private readonly translocoService: TranslocoService
  ) {
  }

  @Input()
  set errors(uiError: UiError) {
    console.log(`uiError: ${JSON.stringify(uiError)}`);
    if (!uiError.isEmpty()) {
      let error = uiError.error;
      if (error && isApiError(error) && error.items) {
        this.formattedErrors = error.items.map(e => this.msgFormat(e));
      }
      else if (uiError.status === 0) {
        this.translocoService.selectTranslate<string>('SZOLGALTATAS_NEM_ELERHETO').subscribe((res: string) => {
          this.formattedErrors.push(res);
        });
      }
      else {
        this.formattedErrors = Object.keys(uiError || {})
          .map(key => `${key} ${Object.assign(uiError)[key]}`);        
      }
    }
    console.log(`formattedErrors: ${JSON.stringify(this.formattedErrors)}`);
  }

  get errorList() { return this.formattedErrors; }

  private msgFormat(item: ApiErrorItem): string {
    console.log(`item: ${JSON.stringify(item)}`);
    let msgBuilt = this.translocoService.translate(item.msgCode);
    if (msgBuilt) {
        // replace {n} to msgParams[n] in msgBuilt, where n>=0
        for (let i=0; i<item.msgParams.length; i++) {
          msgBuilt = msgBuilt.replace("{"+i+"}", item.msgParams[i] as string);
        }
        item.msgParams
    }
    else {
      msgBuilt = item.msgBuilt;
    }
    return msgBuilt;
  }

}
