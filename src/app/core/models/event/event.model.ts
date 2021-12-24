export interface Event {
	eventId?: number;
	description?: string;
	location?: string;
	shortDesc?: string;
	year?: number;
	organizer?: string;
	startTime?: Date;
	endTime?: Date;
}

export function getShortDescWithYearByEvent(event: Event): string {
    return event.shortDesc! + event.year!;
}