import { fetchWithAuth, buildQueryString } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { BudgetModel, CreateBudgetDto, BudgetExecutionResponse } from '../types/budget.types';

export const budgetApi = {
    getAll: (churchId: string, year?: number, month?: number): Promise<BudgetModel[]> =>
        fetchWithAuth<BudgetModel[]>(`/treasury/budgets${buildQueryString({ churchId, year, month })}`),

    create: (data: CreateBudgetDto): Promise<BudgetModel> =>
        fetchWithAuth<BudgetModel>('/treasury/budgets', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    delete: (id: string): Promise<void> =>
        fetchWithAuth<void>(`/treasury/budgets/${id}`, {
            method: 'DELETE'
        }),

    getExecution: (churchId: string, year: number, month: number): Promise<BudgetExecutionResponse> =>
        fetchWithAuth<BudgetExecutionResponse>(`/treasury/budgets/execution${buildQueryString({ churchId, year, month })}`),
};
