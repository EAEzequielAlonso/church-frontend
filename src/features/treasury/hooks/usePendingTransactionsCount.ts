import { useQuery } from '@tanstack/react-query';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { TransactionStatus } from '../types/treasury.types';

export function usePendingTransactionsCount(churchId: string, year: number, month: number) {
    const query = useQuery({
        queryKey: ['transactions', 'pending_count', churchId, year, month],
        queryFn: async () => {
            // Se arma el rango del mes
            const startDate = new Date(year, month - 1, 1).toISOString();
            const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

            const res = await treasuryApi.transactions.getAll(churchId, {
                status: TransactionStatus.PENDING_APPROVAL,
                startDate,
                endDate,
            });

            const array = res?.data || res;
            return Array.isArray(array) ? array.length : 0;
        },
        enabled: !!churchId && !!year && !!month,
    });

    return {
        count: query.data || 0,
        isLoading: query.isLoading,
        refetch: query.refetch
    };
}
