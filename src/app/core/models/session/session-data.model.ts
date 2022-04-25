import { Event, User, UserOfEvent } from "src/app/core/models";

export interface SessionData {
    id?: string;
    appShortName?: string;
    appVersionNumber?: string;
    appVersionDate?: Date;
    actualDateTime?: Date;
    appEmailAddr?: string;
    localeId?: string;
    user?: User;
    event?:	Event;
    userOfEvent?: UserOfEvent;
    newsLine?: string;
    eventCompletionPercent?: number;
    completedEventIds?: number[];
    eventTriggerStartTimes?: Date[];
}