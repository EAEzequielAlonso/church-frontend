import { useQuery } from '@tanstack/react-query';
import { budgetApi } from '../api/budget.api';
import { BudgetExecutionResponse } from '../types/budget.types';

export const budgetExecutionKeys = {
    all: ['budgetExecution'] as const,
    detail: (periodId: string) => [...budgetExecutionKeys.all, periodId] as const,
};

export function useBudgetExecution(periodId: string) {
    const query = useQuery<BudgetExecutionResponse, Error>({
        queryKey: budgetExecutionKeys.detail(periodId),
        queryFn: () => budgetApi.getExecution(periodId),
        enabled: !!periodId,
    });

    return {
        executionData: query.data || null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
