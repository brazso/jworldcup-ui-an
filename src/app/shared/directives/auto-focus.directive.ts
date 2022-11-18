import { AfterContentInit, Directive, ElementRef, Input } from '@angular/core';

/**
 * Auto focus directive for input element which calls the focus method.
 * But if isClicked parameter is true, click method is called instead of the focus.
 */
@Directive({
	selector: '[autoFocus]'
})
export class AutoFocusDirective implements AfterContentInit {

	/**
	 * Can be disabled dynamically.
	 */
	@Input() autoFocusDisabled: boolean = false;

	/**
	 * Use the click method instead of default focus on the element.
	 */
	@Input() autoFocusClicked: boolean = false;

	constructor(private el: ElementRef) { }

	ngAfterContentInit() {
		if (!this.autoFocusDisabled) {
			setTimeout(() => {
				if (this.autoFocusClicked) {
					console.log('auto-focus.directive/ngAfterContentInit/click');
					this.el.nativeElement.click();
				} else {
					console.log('auto-focus.directive/ngAfterContentInit/focus');
					this.el.nativeElement.focus();
				}
			}, 500);
		}
	}
}
