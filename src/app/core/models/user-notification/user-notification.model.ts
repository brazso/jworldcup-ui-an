import { Dictionary, User } from "..";

export interface UserNotification {
    userNotificationId?: number;
    user?: User;
	userNotificationType?: Dictionary;
	creationTime?: Date;
	modificationTime?: Date;
	value?: string;
}
