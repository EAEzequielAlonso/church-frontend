import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '../api/budget.api';
import { CreateBudgetDto } from '../types/budget.types';

export const budgetKeys = {
    all: ['budgets'] as const,
    lists: (churchId: string) => [...budgetKeys.all, churchId] as const,
    list: (churchId: string, year?: number, month?: number) => [...budgetKeys.lists(churchId), { year, month }] as const,
};

export function useBudgets(churchId: string, year?: number, month?: number) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: budgetKeys.list(churchId, year, month),
        queryFn: () => budgetApi.getAll(churchId, year, month),
        enabled: !!churchId,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateBudgetDto) => budgetApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: budgetKeys.lists(churchId) });
            queryClient.invalidateQueries({ queryKey: ['budgetExecution', churchId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => budgetApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: budgetKeys.lists(churchId) });
            queryClient.invalidateQueries({ queryKey: ['budgetExecution', churchId] });
        },
    });

    return {
        budgets: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        createBudget: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        deleteBudget: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}
