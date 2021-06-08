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
