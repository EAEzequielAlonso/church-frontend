import { useState } from 'react';
import useSWR from 'swr';
import { TransactionCategory } from '../types/treasury.types';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { useAuth } from '@/context/AuthContext';

export function useCategories(type?: 'income' | 'expense') {
    const { churchId } = useAuth();

    // UI state for creation
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const { data: categories = [], error, isLoading, mutate } = useSWR<TransactionCategory[]>(
        churchId ? `/treasury/categories?churchId=${churchId}${type ? `&type=${type}` : ''}` : null,
        () => treasuryApi.categories.getAll(churchId!, type)
    );

    const createCategory = async (data: any) => {
        if (!churchId) {
            setCreateError('Church ID is not available.');
            return;
        }
        setIsCreating(true);
        setCreateError(null);
        try {
            const newCategory = await treasuryApi.categories.create({ ...data, churchId });
            mutate(); // Revalidate SWR cache to refetch categories
            return newCategory;
        } catch (err: any) {
            setCreateError(err.message || 'Error creating category');
            throw err;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        categories,
        isLoading,
        error,
        createCategory,
        isCreating,
        createError,
        refetch: mutate // Expose mutate as refetch for convenience
    };
}
