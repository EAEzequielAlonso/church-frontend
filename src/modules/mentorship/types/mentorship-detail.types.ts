import { MentorshipType, MentorshipStatus } from './mentorship.types';

export interface MentorshipMeeting {
    id: string;
    scheduledDate: string;
    endDate?: string;
    isCompleted: boolean;
    location?: string;
    completedAt?: string;
    title?: string;
    description?: string;
    color?: string;
}

export interface MentorshipNote {
    id: string;
    content: string;
    type: string;
    createdAt: string;
    authorChurchPersonId: string;
}

export interface MentorshipParticipant {
    id: string;
    churchPersonId: string;
    role: 'MENTOR' | 'PARTICIPANT';
    status: 'PENDING' | 'AUTO_ACCEPTED' | 'ACCEPTED';
    joinedAt: string;
}

export interface MentorshipTask {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    isCompleted: boolean;
    assignedChurchPersonId?: string;
    creatorChurchPersonId: string;
}

export interface MentorshipDetail {
    id: string;
    type: MentorshipType;
    mode: string;
    status: MentorshipStatus;
    churchId: string;
    createdAt: string;
    startDate?: string;
    endDate?: string;
    participants: MentorshipParticipant[];
    meetings: MentorshipMeeting[];
    notes: MentorshipNote[];
    tasks: MentorshipTask[];
}
