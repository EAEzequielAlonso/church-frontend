import { fetchWithAuth, buildQueryString } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { GetAuditLogsParams, AuditLogPaginatedResponse } from '../types/audit.types';

export const auditApi = {
    getAll: (params: GetAuditLogsParams): Promise<AuditLogPaginatedResponse> =>
        fetchWithAuth<AuditLogPaginatedResponse>(`/treasury/audit${buildQueryString(params as any)}`),
};
