import { ApiErrorItem } from './apiErrorItem.model';

export interface ApiError {
    status: string;
    timestamp: Date;
    message?: string;
    exceptionClassName: string;
    items?: ApiErrorItem[];
}
