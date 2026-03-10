import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/audit.api';
import { GetAuditLogsParams } from '../types/audit.types';

export function useAuditLogs(params: GetAuditLogsParams) {
    return useQuery({
        queryKey: ['treasury', 'audit', params],
        queryFn: () => auditApi.getAll(params),
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}
