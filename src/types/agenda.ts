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

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
    [CalendarEventType.PERSONAL]: "#3b82f6",
    [CalendarEventType.SMALL_GROUP]: "#10b981",
    [CalendarEventType.COURSE]: "#f59e0b",
    [CalendarEventType.ACTIVITY]: "#8b5cf6",
    [CalendarEventType.MINISTRY]: "#6366f1",
    [CalendarEventType.COUNSELING]: "#ef4444",
    [CalendarEventType.CHURCH]: "#1d4ed8",
    [CalendarEventType.DISCIPLESHIP]: "#06b6d4",
    [CalendarEventType.FOLLOW_UP]: "#14b8a6",
    [CalendarEventType.OTHER]: "#94a3b8",
};

export const EVENT_TYPE_ICONS: Record<CalendarEventType, string> = {
    [CalendarEventType.PERSONAL]: "User",
    [CalendarEventType.SMALL_GROUP]: "Users",
    [CalendarEventType.COURSE]: "BookOpen",
    [CalendarEventType.ACTIVITY]: "Star",
    [CalendarEventType.MINISTRY]: "Briefcase",
    [CalendarEventType.COUNSELING]: "HeartHandshake",
    [CalendarEventType.CHURCH]: "Church",
    [CalendarEventType.DISCIPLESHIP]: "GraduationCap",
    [CalendarEventType.FOLLOW_UP]: "UserPlus",
    [CalendarEventType.OTHER]: "Calendar",
};

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
