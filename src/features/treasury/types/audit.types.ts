import { AuditAction, AuditEntityType } from './treasury.types';

export interface AuditLogDto {
    id: string;
    churchId: string;
    entityType: AuditEntityType;
    entityId: string;
    action: AuditAction;
    before?: any;
    after?: any;
    entityVersion: string;
    performedByUserId: string;
    performedByEmail?: string;
    performedByRole?: string;
    ipAddress?: string;
    reason?: string;
    createdAt: string;
}

export interface GetAuditLogsParams {
    startDate?: string;
    endDate?: string;
    entityType?: AuditEntityType | string;
    action?: AuditAction | string;
    userId?: string;
    entityId?: string;
    limit?: number;
    page?: number;
}

export interface AuditLogPaginatedResponse {
    data: AuditLogDto[];
    total: number;
    limit: number;
    offset: number;
}

