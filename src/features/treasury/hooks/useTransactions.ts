import useSWR from 'swr';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import * as mapper from '../mappers/treasury.mapper';
import { useAuth } from '@/context/AuthContext';
import { TreasuryTransactionModel } from '../types/treasury.types';

export function useTransactions(filters: any = {}) {
    const { churchId } = useAuth();

    // Create a stable key based on filters
    const { type } = filters; // Assuming 'type' is part of filters
    const key = churchId ? `/treasury/transactions?churchId=${churchId}${type ? `&type=${type}` : ''}` : null;

    const { data: transactions, error, isLoading, mutate } = useSWR<TreasuryTransactionModel[]>(
        key,
        () => treasuryApi.transactions.getAll(churchId!, { type }).then((dtos: any[]) => dtos.map(mapper.toUiTransaction))
    );

    // The API now directly returns an array of DTOs and we map them to UI Models.
    // Backend GetTransactionsUseCase currently returns TreasuryTransactionDto[].
    const transactions_list = transactions || [];

    // Optional: if backend ever restores pagination, update both treasuryApi and this hook.
    const meta = {
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
