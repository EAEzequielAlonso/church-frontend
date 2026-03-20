import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '../api/budget.api';
import { CreateBudgetAllocationDto } from '../types/budget.types';

export const budgetAllocationKeys = {
    all: ['budgetAllocations'] as const,
    list: (periodId: string) => [...budgetAllocationKeys.all, periodId] as const,
};

export function useBudgetAllocations(periodId: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: budgetAllocationKeys.list(periodId),
        queryFn: () => budgetApi.getAllocations(periodId),
        enabled: !!periodId,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateBudgetAllocationDto) => budgetApi.createAllocation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.list(periodId) });
            queryClient.invalidateQueries({ queryKey: ['budgetExecution'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, amount }: { id: string; amount: number }) =>
            budgetApi.updateAllocation(id, { amount }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.list(periodId) });
            queryClient.invalidateQueries({ queryKey: ['budgetExecution'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => budgetApi.deleteAllocation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.list(periodId) });
            queryClient.invalidateQueries({ queryKey: ['budgetExecution'] });
        },
    });

    return {
        allocations: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        createAllocation: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateAllocation: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteAllocation: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}
