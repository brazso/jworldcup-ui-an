import { UserGroup } from "./user-group.model";

export interface UserGroupExtended extends UserGroup {
	userId?: number;
	message?: string; // chat
}
