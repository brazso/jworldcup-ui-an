import { User } from "..";

export interface UserGroup {
	userGroupId?: number;
	isPublicEditable?: boolean;
	isPublicVisible?: boolean;
	name?: string;
	users? : User[];
	owner?: User;
}
