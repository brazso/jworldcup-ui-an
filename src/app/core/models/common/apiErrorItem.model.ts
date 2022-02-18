import { ParameterizedMessageTypeEnum } from './enums';

/**
 * comes from ParameterizedMessageDto
 */
export interface ApiErrorItem {
    msgCode: string;
	msgType: ParameterizedMessageTypeEnum;
	msgParams: Object[];
	msgBuilt: string;
}

/**
 * Creates msgBuilt using msgParams from the given item.
 * @param item - source item 
 * @param msgBuilt - translated dictionary value by msgCode
 * @returns formatted message
 */
export function apiErrorItemMsgFormat(item: ApiErrorItem, msgBuilt?: string): string {
	return msgBuilt ? msgBuilt.format(...item.msgParams) : item.msgBuilt;
}
