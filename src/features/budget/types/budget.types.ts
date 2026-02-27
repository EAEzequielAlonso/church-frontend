export enum BudgetPeriodType {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export interface BudgetPeriod {
    id: string;
    name: string;
    type: BudgetPeriodType;
    startDate: string;
    endDate: string;
    currency: string;
}

export interface BudgetAllocation {
    id: string;
    budgetPeriodId: string;
    ministry?: { id: string; name: string };
    category?: { id: string; name: string };
    amountBaseCurrency: number;
}

export interface BudgetAllocationResult {
    allocationId: string;
    ministry: { id: string; name: string } | null;
    category: { id: string; name: string; type?: string } | null;
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    usagePercentage: number;
}

export interface BudgetExecutionSummary {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    usagePercentage: number;
}

export interface BudgetExecutionResponse {
    period: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
    };
    summary: BudgetExecutionSummary;
    allocations: BudgetAllocationResult[];
}

export interface CreateBudgetPeriodDto {
    name: string;
    type: BudgetPeriodType;
    startDate: string;
    endDate: string;
    currency?: string;
}

export interface CreateBudgetAllocationDto {
    budgetPeriodId: string;
    ministryId?: string;
    categoryId?: string;
    amount: number;
}
