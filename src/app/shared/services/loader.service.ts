import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

    private loaderSubject = new Subject<LoaderState>();
    loaderState = this.loaderSubject.asObservable();

    private loaderCount: number = 0;

    constructor() { }

    show() {
        this.loaderCount++;
        if (this.loaderCount)
            setTimeout(() => {
                this.loaderSubject.next(<LoaderState>{ show: true });
            }, 0);
    }

    hide() {
        this.loaderCount--;
        if (!this.loaderCount)
            setTimeout(() => {
                this.loaderSubject.next(<LoaderState>{ show: false });
            }, 0);
    }
}

export interface LoaderState {
    show: boolean;
}

