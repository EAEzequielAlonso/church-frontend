import { useQuery } from '@tanstack/react-query';
import { budgetApi } from '../api/budget.api';
import { BudgetExecutionResponse } from '../types/budget.types';

export const budgetExecutionKeys = {
    all: ['budgetExecution'] as const,
    detail: (churchId: string, year: number, month: number) => [...budgetExecutionKeys.all, churchId, year, month] as const,
};

export function useBudgetExecution(churchId: string, year?: number, month?: number) {
    const query = useQuery<BudgetExecutionResponse, Error>({
        queryKey: budgetExecutionKeys.detail(churchId, year!, month!),
        queryFn: () => budgetApi.getExecution(churchId, year!, month!),
        enabled: !!churchId && !!year && !!month, // Only fetch if we have the full date criteria
    });

    return {
        executionData: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
