import { AfterContentInit, Directive, ElementRef, Input } from '@angular/core';

/**
 * Auto focus direktíva input elemre, amelyen meghívja a focus metódust.
 * Amennyiben az isClicked paraméter true, az focus helyett a click hívódik
 * meg.
 */
@Directive({
	selector: '[autoFocus]'
})
export class AutoFocusDirective implements AfterContentInit {

	/**
	 * Dinamikusan kikapcsolható a direktíva.
	 */
	@Input() public autoFocusDisabled: boolean = false;

	/**
	 * A click metódust használja inkább az elemen a default focus helyett.
	 */
	@Input() public autoFocusClicked: boolean = false;

	public constructor(private el: ElementRef) { }

	public ngAfterContentInit() {
		if (!this.autoFocusDisabled) {
			setTimeout(() => {
				if (this.autoFocusClicked) {
					this.el.nativeElement.click();
				} else {
					this.el.nativeElement.focus();
				}
			}, 500);
		}
	}
}