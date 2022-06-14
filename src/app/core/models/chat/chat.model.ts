import { Event, User, UserGroup } from "src/app/core/models";

export interface Chat {
    chatId?: number;
    // event?: Event;
    message?: string;
    modificationTime?: Date;
    // userGroup?: UserGroup;
    user?: User;
    // targetUser?: User;
    isPrivate?: boolean;
}
