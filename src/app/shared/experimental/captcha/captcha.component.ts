import {AfterViewInit,Component,EventEmitter,Input,NgZone,OnDestroy,Output,ElementRef,ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'z-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
      'class': 'p-element'
  }
})
/**
 * Fix for https://github.com/primefaces/primeng/issues/10112 - "Error: reCAPTCHA has already been rendered in this element"
 */
export class CaptchaComponent implements AfterViewInit,OnDestroy {

    @Input() siteKey: string | null = null;

    @Input() theme = 'light';

    @Input() type = 'image';

    @Input() size = 'normal';

    @Input() tabindex = 0;

    @Input() initCallback = "initRecaptcha";

    @Output() onResponse: EventEmitter<any> = new EventEmitter();

    @Output() onExpire: EventEmitter<any> = new EventEmitter();

    private _instance: any = null;

    private _language: any = null;


    @Input() get language(): string {
        return this._language;
    }

    set language(language: string) {
        this._language = language;
        console.log(`captcha.component/language/init`);
        this.init();
    }

    constructor(public el: ElementRef, public _zone: NgZone, public cd: ChangeDetectorRef) {}

    ngAfterViewInit() {
        if ((<any>window).grecaptcha) {
            if (!(<any>window).grecaptcha.render){
                setTimeout(() =>{
                    console.log(`captcha.component/ngAfterViewInit/init1`);
                    this.init();
                },100)
            }
            else {
                console.log(`captcha.component/ngAfterViewInit/init2`);
                this.init();
            }
        }
        else {
            (<any>window)[this.initCallback] = () => {
                console.log(`captcha.component/ngAfterViewInit/init3`);
                this.init();
            }
        }
    }

    init() {
        // console.log(`captcha.component/init: innerHTML1=${JSON.stringify(this.el.nativeElement.innerHTML)}`);
        this.el.nativeElement.innerHTML = "<div></div>"; // fix
        this.reset();
        // console.log(`captcha.component/init: innerHTML2=${JSON.stringify(this.el.nativeElement.innerHTML)}`);
        

        this._instance = (<any>window).grecaptcha.render(this.el.nativeElement.firstChild, {
            'sitekey': this.siteKey,
            'theme': this.theme,
            'type': this.type,
            'size': this.size,
            'tabindex': this.tabindex,
            'hl': this.language,
            'callback': (response: string) => {
                console.log(`captcha.component/init/callback`);
                this._zone.run(() => this.recaptchaCallback(response))
            },
            'expired-callback': () => {
                console.log(`captcha.component/init/expired-callback`);
                this._zone.run(() => this.recaptchaExpiredCallback())
            }
        });
        console.log(`captcha.component/init: _instance=${JSON.stringify(this._instance)}`);
    }

    reset() {
        console.log(`captcha.component/reset: _instance=${JSON.stringify(this._instance)}`);
        if (this._instance === null)
            return;

        (<any>window).grecaptcha.reset(this._instance);
        this.cd.markForCheck();
    }

    getResponse(): String | null {
        if (this._instance === null)
            return null;

        return (<any>window).grecaptcha.getResponse(this._instance);
    }

    recaptchaCallback(response: string) {
        this.onResponse.emit({
            response: response
        });
    }

    recaptchaExpiredCallback() {
        this.onExpire.emit();
    }

    ngOnDestroy() {
        console.log(`captcha.component/ngOnDestroy: _instance=${JSON.stringify(this._instance)}`);
        if (this._instance != null) {
          (<any>window).grecaptcha.reset(this._instance);
        }
    }
}