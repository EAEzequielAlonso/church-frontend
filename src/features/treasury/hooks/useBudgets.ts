
import useSWR, { mutate } from 'swr';
import * as api from '../api/budget.api';
import { useAuth } from '@/context/AuthContext';
import { CreateBudgetDto } from '../types/budget.types';
import { useState } from 'react';

export function useBudgets(year?: number) {
    const { churchId } = useAuth();
    const key = churchId ? `/treasury/budgets?churchId=${churchId}&year=${year || new Date().getFullYear()}` : null;

    const { data, error, isLoading, mutate: reload } = useSWR(key, () => api.getBudgets(churchId!, year));

    const create = async (dto: Omit<CreateBudgetDto, 'churchId'>) => {
        if (!churchId) return;
        await api.createBudget({ ...dto, churchId });
        reload();
    };

    const remove = async (id: string) => {
        await api.deleteBudget(id);
        reload();
    };

    return {
        budgets: data || [],
        isLoading,
        error,
        create,
        remove,
        reload
    };
}
