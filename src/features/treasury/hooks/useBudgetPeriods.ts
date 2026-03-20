import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '../api/budget.api';
import { CreateBudgetPeriodDto } from '../types/budget.types';

export const budgetPeriodKeys = {
    all: ['budgetPeriods'] as const,
    list: (year?: number) => [...budgetPeriodKeys.all, { year }] as const,
};

export function useBudgetPeriods(year?: number) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: budgetPeriodKeys.list(year),
        queryFn: () => budgetApi.getPeriods(year),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateBudgetPeriodDto) => budgetApi.createPeriod(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: budgetPeriodKeys.all });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => budgetApi.deletePeriod(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: budgetPeriodKeys.all });
        },
    });

    return {
        periods: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        createPeriod: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        deletePeriod: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}
