import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class DateParserInterceptor implements HttpInterceptor {  // TODO - needed?
    private dateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)$/;

    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (request.body instanceof Object && !(request.body instanceof FormData)) {
            request = request.clone({
                body: this.cloneAndConvertToStrings(request.body)
            });
        }

        return next.handle(request)
            .pipe(
                tap((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        this.convertToDates(event.body);
                    }
                }));
    }

    private convertToDates(object: any) {
        if (!object || !(object instanceof Object)) {
            return;
        }

        if (object instanceof Array) {
            for (const item of object) {
                this.convertToDates(item);
            }
        }

        // const myObj: {[index: string]:any} = {}
        for (const key of Object.keys(object)) {
            const value = object[key];

            if (value instanceof Array) {
                for (const item of value) {
                    this.convertToDates(item);
                }
            }

            if (value instanceof Object) {
                this.convertToDates(value);
            }

            if (typeof value === 'string' && this.dateRegex.test(value)) {
                object[key] = new Date(value);
            }
        }
    }

    private pad(input: number, length: number = 2): string {
        let value: string = '' + input;
        while (value.length < length) {
            value = '0' + value;
        }
        return value;
    }

    private cloneAndConvertToStrings(o: any) {
        var out: any, v, key;
        if (typeof o !== 'object') {
            out = o;
        } else if (o instanceof Date) {
            out = o.getFullYear() + '-' +
                this.pad(1 + o.getMonth()) + '-' +
                this.pad(o.getDate()) + 'T' +
                this.pad(o.getHours()) + ':' +
                this.pad(o.getMinutes()) + ':' +
                this.pad(o.getSeconds()) + '.' +
                this.pad(o.getMilliseconds(), 3) + 'Z';
        } else {
            out = Array.isArray(o) ? [] : {};
            for (key in o) {
                v = o[key];
                out[key] = (typeof v === "object" && v !== null) ? this.cloneAndConvertToStrings(v) : v;
            }
        }

        return out;
    }
}