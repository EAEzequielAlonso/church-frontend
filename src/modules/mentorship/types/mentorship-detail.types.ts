import { MentorshipType, MentorshipStatus, MentorshipParticipant } from './mentorship.types';

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
    type: 'INTERNAL' | 'SHARED' | 'SUPERVISION';
    createdAt: string;
    authorChurchPersonId: string;
}



export interface MentorshipTask {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED';
    isGroupTask: boolean;
    assignedChurchPersonId?: string;
    creatorChurchPersonId: string;
    mentorInstruction?: string;
    menteeResponse?: string;
    mentorFeedback?: string;
    completedAt?: string;
    meetingId?: string;
}

export interface MentorshipDetail {
    id: string;
    type: MentorshipType;
    mode: string;
    status: MentorshipStatus;
    churchId: string;
    createdAt: string;
    motive?: string;
    mentorSummary?: string;
    menteeSummary?: string;
    startDate?: string;
    endDate?: string;
    participants: MentorshipParticipant[];
    meetings: MentorshipMeeting[];
    notes: MentorshipNote[];
    tasks: MentorshipTask[];
}
