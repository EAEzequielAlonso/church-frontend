import useSWR from 'swr';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import * as mapper from '../mappers/treasury.mapper';
import { useAuth } from '@/context/AuthContext';
import { TreasuryTransactionModel } from '../types/treasury.types';

export function useTransactions(filters: any = {}) {
    const { churchId } = useAuth();

    // Create a stable key based on ALL filters
    const key = churchId ? `/treasury/transactions?churchId=${churchId}&${JSON.stringify(filters)}` : null;

    const { data: response, error, isLoading, mutate } = useSWR(
        key,
        () => treasuryApi.transactions.getAll(churchId!, filters)
    );

    // Mapped UI Models from the paginated backend response
    const transactions_list = Array.isArray(response?.data) 
        ? response.data.map((dto: any) => mapper.toUiTransaction(dto)) 
        : [];

    const meta = response?.meta || {
        total: transactions_list.length,
        page: 1,
        lastPage: 1
    };

    return {
        transactions: transactions_list,
        meta,
        isLoading,
        error,
        mutate
    };
}
