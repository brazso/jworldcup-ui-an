import { Directive, forwardRef, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';

@Directive({
    selector: '[customValidator][ngModel],[customValidator][ngFormControl]',
    providers: [{
        multi: true,
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => CustomValidator)
    }]
})
export class CustomValidator implements Validator {
    @Input() customValidator: ValidatorFn; //same name as the selector

    validate(control: AbstractControl): { [key: string]: any; } {
        return this.customValidator(control)!;
    }
}