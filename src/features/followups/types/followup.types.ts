export enum FollowupStatus {
    VISITOR = 'VISITOR',
    PROSPECT = 'PROSPECT',
    ARCHIVED = 'ARCHIVED'
}

export enum FollowupNoteType {
    PERSONAL = 'PERSONAL',
    SUPERVISION = 'SUPERVISION'
}

export interface FollowupPerson {
    id: string;
    firstName: string;
    lastName: string;
    // Add other fields as needed from Person entity
}

export interface Followup {
    id: string;
    churchId: string;
    followupPersonId: string;
    followupPerson?: FollowupPerson;
    assignedToPersonId: string;
    assignedToPerson?: FollowupPerson; // Reusing interface for Person
    createdByPersonId: string;
    status: FollowupStatus;
    createdAt: string;
    updatedAt: string;
    archivedAt?: string;
}

export interface FollowupNote {
    id: string;
    churchId: string;
    followupId: string;
    authorPersonId: string;
    authorPerson?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    type: FollowupNoteType;
    content: string;
    createdAt: string;
}
