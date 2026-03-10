import { Person, MinistryRole } from "./auth-types";
import { CalendarEvent } from "./agenda";

export enum MinistryEventType {
    MEETING = 'MEETING',
    REHEARSAL = 'REHEARSAL',
    SERVICE = 'SERVICE',
    ACTIVITY = 'ACTIVITY',
    OTHER = 'OTHER',
}

export interface Ministry {
    id: string;
    name: string;
    description?: string;
    color: string;
    status: 'active' | 'inactive';
    leader?: {
        id: string;
        person: Person;
    };
    members: MinistryMember[];
    tasks: MinistryTask[];
    calendarEvents: CalendarEvent[];
    serviceDuties?: ServiceDuty[];
}

export interface ServiceDuty {
    id: string;
    name: string;
    behaviorType: string;
}

export interface MinistryMember {
    id: string;
    member: {
        id: string;
        person: Person;
    };
    roleInMinistry: MinistryRole;
    status: 'active' | 'inactive';
    joinedAt: string;
}

export interface MinistryTask {
    id: string;
    title: string;
    description?: string;
    observation?: string;
    assignedTo?: {
        id: string;
        person: Person;
    };
    dueDate?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'incomplete' | 'cancelled';
    createdAt: string;
}

export interface MeetingNote {
    id: string;
    eventId: string;
    summary?: string;
    decisions?: string;
    nextSteps?: string;
    createdBy: Person;
    createdAt: string;
}
