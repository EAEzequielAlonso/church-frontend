// Enums (Synced with Backend src/common/enums.ts)

export enum SystemRole {
    ADMIN_APP = 'ADMIN_APP',
    USER = 'USER'
}

export enum PlanType {
    TRIAL = 'TRIAL',
    BASIC = 'BASIC',
    PRO = 'PRO',
    ELITE = 'ELITE',
}

export enum SubscriptionStatus {
    TRIAL = 'TRIAL',
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
}

export enum MembershipStatus {
    INVITED = 'INVITED',
    VISITOR = 'VISITOR',
    PROSPECT = 'PROSPECT',
    MEMBER = 'MEMBER',
    CHILD = 'CHILD',
    DISCIPLINED = 'DISCIPLINED',
    EXCOMMUNICATED = 'EXCOMMUNICATED',
    INACTIVE = 'INACTIVE',
    ARCHIVED = 'ARCHIVED'
}

export enum FollowUpStatus {
    VISITOR = 'VISITOR',       // Visitante frecuente
    PROSPECT = 'PROSPECT',     // Listo para membresía
    ARCHIVED = 'ARCHIVED',     // Ya no viene más
}

export enum EcclesiasticalRole {
    PASTOR = 'PASTOR',
    BISHOP = 'BISHOP',
    ELDER = 'ELDER',
    DEACON = 'DEACON',
    NONE = 'NONE'
}

export enum FunctionalRole {
    ADMIN_CHURCH = 'ADMIN_CHURCH',
    TREASURER = 'TREASURER',
    AUDITOR = 'AUDITOR',
    COUNSELOR = 'COUNSELOR',
    MINISTRY_LEADER = 'MINISTRY_LEADER',
    LIBRARIAN = 'LIBRARIAN',
    MEMBER = 'MEMBER'
}

export enum Permission {
    TREASURY_VIEW = 'TREASURY_VIEW',
    TREASURY_MANAGE = 'TREASURY_MANAGE',
    MEMBERS_VIEW = 'MEMBERS_VIEW',
    MEMBERS_MANAGE = 'MEMBERS_MANAGE',
    COUNSELING_VIEW_OWN = 'COUNSELING_VIEW_OWN',
    COUNSELING_MANAGE_ALL = 'COUNSELING_MANAGE_ALL',
    GROUPS_VIEW = 'GROUPS_VIEW',
    GROUPS_MANAGE = 'GROUPS_MANAGE',
    LIBRARY_MANAGE = 'LIBRARY_MANAGE',
    SETTINGS_MANAGE = 'SETTINGS_MANAGE',
}

export enum MinistryRole {
    LEADER = 'MINISTRY_LEADER',
    COORDINATOR = 'MINISTRY_COORDINATOR',
    TEAM_MEMBER = 'MINISTRY_TEAM_MEMBER'
}

export enum SmallGroupRole {
    MODERATOR = 'MODERATOR',
    COLLABORATOR = 'COLLABORATOR',
    PARTICIPANT = 'PARTICIPANT'
}

export enum FamilyRole {
    FATHER = 'FATHER',
    MOTHER = 'MOTHER',
    CHILD = 'CHILD',
    SPOUSE = 'SPOUSE',
    MEMBER = 'MEMBER'
}

// Interfaces

export interface Person {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
}

export interface User {
    id: string;
    email: string;
    fullName?: string; // From Person
    personId?: string;
    systemRole: SystemRole;
    isOnboarded: boolean;
    roles: string[]; // Aggregated active roles (Ecclesiastical, etc.) for current context
    avatarUrl?: string; // From Person
}

export interface Church {
    id: string;
    name: string;
    slug: string;
    plan: PlanType;
}

export interface ChurchMember {
    id: string;
    personId: string;
    churchId: string;
    ecclesiasticalRole: EcclesiasticalRole;
    functionalRoles: FunctionalRole[];
    status: MembershipStatus;
    joinedAt: string;
}
