import { Component, Input } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';

/**
 * Validation component for template-driven forms
 */
@Component({
  selector: 'app-input-validation',
  templateUrl: './input-validation.component.html',
  styleUrls: ['./input-validation.component.scss']
})
export class InputValidationComponent {

  @Input() control: NgModel;
  @Input() form: NgForm;
  @Input() errDef: any;

  @Input() custom: any;

  errorMessages: string[] = [];
  errorMessage: string = '';

  hasError(): boolean {
    this.errorMessages = [];
    this.errorMessage = '';
    if ( this.errDef && ( this.control.errors || this.errDef['custom'] ) ) {
      Object.keys(this.errDef).some(key => {

        if ( this.control.errors && this.control.errors[key]) {
          this.errorMessages.push(this.errDef[key]);
        } else if ( key === 'custom' && !this.runCustom() ) {
          this.errorMessages.push(this.errDef[key]);
        }
        return false;
      });
    }

    for ( const m of this.errorMessages ){
      if ( this.errorMessage.length > 0 ) {
        this.errorMessage = this.errorMessage + '.  ';
      }
      this.errorMessage = this.errorMessage + m;
    }

    return this.errorMessages.length > 0  && ((this.control.dirty ?? false) || !!this.form);
  }

  public runCustom(): boolean {
    return this.custom(this);
  }

}
