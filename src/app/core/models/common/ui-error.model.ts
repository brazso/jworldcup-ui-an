import { HttpErrorResponse } from "@angular/common/http";

export class UiError extends HttpErrorResponse {
    constructor(response: HttpErrorResponse | any) {
        super(Object.assign(response));
    }

    public isEmpty(): boolean {
        return !this.url;
    }
}
