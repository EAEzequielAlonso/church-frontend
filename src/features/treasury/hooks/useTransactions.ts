import useSWR from 'swr';
import * as api from '../api/treasury.api';
import * as mapper from '../mappers/treasury.mapper';
import { useAuth } from '@/context/AuthContext';
import { TreasuryTransactionModel } from '../types/treasury.types';

export function useTransactions(filters: api.TransactionFilters = {}) {
    const { churchId } = useAuth();

    // Create a stable key based on filters
    const key = churchId ? `/treasury/transactions?churchId=${churchId}&` + new URLSearchParams(filters as any).toString() : null;

    const { data, error, isLoading, mutate } = useSWR(
        key,
        () => api.getTransactions(churchId!, filters)
    );

    const transactions: TreasuryTransactionModel[] = data?.data ? data.data.map(mapper.toUiTransaction) : [];
    const meta = data?.meta;

    return {
        transactions,
        meta,
        isLoading,
        error,
        mutate
    };
}
