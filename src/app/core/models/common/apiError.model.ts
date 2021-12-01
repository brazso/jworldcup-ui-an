import { ApiErrorItem } from './apiErrorItem.model';

export interface ApiError {
    status: string;
    timestamp: Date;
    message?: string;
    exceptionClassName: string;
    items?: ApiErrorItem[];
}

export function isApiError(object: any): object is ApiError {
    return Object.prototype.hasOwnProperty.call(object, "status")
        && Object.prototype.hasOwnProperty.call(object, "timestamp")
        && Object.prototype.hasOwnProperty.call(object, "exceptionClassName");
}