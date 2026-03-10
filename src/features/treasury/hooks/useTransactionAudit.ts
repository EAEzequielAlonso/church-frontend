import useSWR from 'swr';
import { auditApi } from '../api/audit.api';
import { AuditLogDto } from '../types/audit.types';
import { AuditEntityType } from '../types/treasury.types';

export function useTransactionAudit(transactionId: string | undefined) {
    const key = transactionId ? `/treasury/audit?entityId=${transactionId}&entityType=TRANSACTION` : null;

    const { data, error, isLoading } = useSWR(key, async () => {
        if (!transactionId) return [];
        const res = await auditApi.getAll({
            entityId: transactionId,
            entityType: AuditEntityType.TRANSACTION,
            limit: 50
        });
        return res.data;
    });

    return {
        logs: (data as AuditLogDto[]) || [],
        isLoading,
        error
    };
}
