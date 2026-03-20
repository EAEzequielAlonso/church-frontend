import { fetchWithAuth } from '@/app/(dashboard)/treasury/services/treasuryApi';
import {
    BudgetPeriod,
    BudgetAllocation,
    BudgetExecutionResponse,
    CreateBudgetPeriodDto,
    CreateBudgetAllocationDto,
} from '../types/budget.types';

export const budgetApi = {
    // ── Periods ──

    getPeriods: (year?: number): Promise<BudgetPeriod[]> =>
        fetchWithAuth<BudgetPeriod[]>(`/budget/periods${year ? `?year=${year}` : ''}`),

    createPeriod: (data: CreateBudgetPeriodDto): Promise<BudgetPeriod> =>
        fetchWithAuth<BudgetPeriod>('/budget/periods', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updatePeriod: (id: string, data: Partial<CreateBudgetPeriodDto>): Promise<BudgetPeriod> =>
        fetchWithAuth<BudgetPeriod>(`/budget/periods/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    deletePeriod: (id: string): Promise<void> =>
        fetchWithAuth<void>(`/budget/periods/${id}`, { method: 'DELETE' }),

    // ── Allocations ──

    getAllocations: (periodId: string): Promise<BudgetAllocation[]> =>
        fetchWithAuth<BudgetAllocation[]>(`/budget/allocations?periodId=${periodId}`),

    createAllocation: (data: CreateBudgetAllocationDto): Promise<BudgetAllocation> =>
        fetchWithAuth<BudgetAllocation>('/budget/allocations', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateAllocation: (id: string, data: { amount: number }): Promise<BudgetAllocation> =>
        fetchWithAuth<BudgetAllocation>(`/budget/allocations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    deleteAllocation: (id: string): Promise<void> =>
        fetchWithAuth<void>(`/budget/allocations/${id}`, { method: 'DELETE' }),

    // ── Execution ──

    getExecution: (periodId: string): Promise<BudgetExecutionResponse> =>
        fetchWithAuth<BudgetExecutionResponse>(`/budget/execution/${periodId}`),
};
