
import useSWR from 'swr';
import * as api from '../api/audit.api';

export function useTransactionAudit(transactionId: string | undefined) {
    const key = transactionId ? `/treasury/transactions/${transactionId}/audit` : null;

    const { data, error, isLoading } = useSWR(key, () => api.getAuditLogs(transactionId!));

    return {
        logs: data || [],
        isLoading,
        error
    };
}
