import { ApiErrorItem } from './apiErrorItem.model';
import { ParameterizedMessageTypeEnum } from './enums';

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

export function buildApiErrorByApiErrorItem(item: ApiErrorItem): ApiError {
    return {status: 'dummy', timestamp: new Date(), exceptionClassName: 'dummy', items: [item]} as ApiError;
}

export function getApiErrorOverallType(apiError: ApiError): ParameterizedMessageTypeEnum | null {
    let msgType: ParameterizedMessageTypeEnum | null = null;
    
    for (const item of apiError.items ?? []){
        switch (item.msgType) {
            case ParameterizedMessageTypeEnum.ERROR:
                return ParameterizedMessageTypeEnum.ERROR;
            case ParameterizedMessageTypeEnum.WARNING:
                msgType = ParameterizedMessageTypeEnum.WARNING;
                break;
            case ParameterizedMessageTypeEnum.INFO:
                if (msgType !== ParameterizedMessageTypeEnum.WARNING) {
                    msgType = ParameterizedMessageTypeEnum.INFO;
                }
                break;
        }
    }
    return msgType;
};
