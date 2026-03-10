export enum CalendarEventType {
    PERSONAL = 'PERSONAL',
    MINISTRY = 'MINISTRY',
    CHURCH = 'CHURCH',
    COUNSELING = 'COUNSELING',
    SMALL_GROUP = 'SMALL_GROUP',
    DISCIPLESHIP = 'DISCIPLESHIP',
    FOLLOW_UP = 'FOLLOW_UP',
    COURSE = 'COURSE',
    ACTIVITY = 'ACTIVITY',
    OTHER = 'OTHER'
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    type: CalendarEventType;
    color?: string;
    isAllDay?: boolean;
    ownerId?: string;
    attendees?: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    }[];
    meetingNote?: any;
}

export interface CreateCalendarEventDto {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    type: CalendarEventType;
    color?: string;
    isAllDay?: boolean;
    ownerId?: string;
    attendeeIds?: string[];
}
