import { Event, User, UserOfEvent } from "src/app/core/models";

export interface SessionInfo {
    id: string;
    appShortName?: string;
    appVersionNumber?: string;
    appVersionDate?: Date;
    appCheatDateTime?: Date;
    appEmailAddr?: string;
    user?: User;
    event?:	Event;
    userOfEvent?: UserOfEvent;
    newsLine?: string;
}