// ── Budget Period Types ──

export enum BudgetPeriodType {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
    QUARTERLY = 'QUARTERLY',
    CUSTOM = 'CUSTOM',
    PROJECT = 'PROJECT',
}

export enum BudgetPeriodStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
}

export interface BudgetPeriod {
    id: string;
    churchId: string;
    name: string;
    type: BudgetPeriodType;
    status: BudgetPeriodStatus;
    startDate: string;
    endDate: string;
    description?: string | null;
    currency?: string;
    createdAt?: string;
}

// ── Budget Allocation Types ──

export type TransactionType = 'income' | 'expense';

export interface BudgetAllocation {
    id: string;
    churchId: string;
    budgetPeriodId: string;
    ministryId?: string | null;
    categoryId?: string | null;
    type: TransactionType;
    amountBaseCurrency: number;
    notes?: string | null;
}

// ── Budget Execution Types ──

export enum BudgetExecutionStatus {
    OK = 'OK',
    WARNING_80 = 'WARNING_80',
    EXCEEDED = 'EXCEEDED',
}

export interface AllocationMonthlyBreakdown {
    month: string; // "2026-01"
    amount: number;
}

export interface AllocationExecution {
    allocationId: string;
    type: TransactionType;
    ministry: { id: string; name: string } | null;
    category: { id: string; name: string; type: string } | null;
    allocatedAmount: number;
    executedAmount: number;
    remainingAmount: number;
    usagePercentage: number;
    status: BudgetExecutionStatus;
    notes: string | null;
    monthlyBreakdown: AllocationMonthlyBreakdown[];
}

export interface CoherenceSummary {
    totalIncomeBudgeted: number;
    totalExpenseBudgeted: number;
    totalIncomeActual: number;
    totalExpenseActual: number;
    projectedBalance: number;
    actualBalance: number;
}

export interface BudgetExecutionResponse {
    period: {
        id: string;
        name: string;
        type: string;
        status: string;
        startDate: string;
        endDate: string;
        description: string | null;
    };
    coherence: CoherenceSummary;
    allocations: AllocationExecution[];
}

// ── DTOs ──

export interface CreateBudgetPeriodDto {
    name: string;
    type: BudgetPeriodType;
    startDate: string;
    endDate: string;
    description?: string;
    currency?: string;
}

export interface CreateBudgetAllocationDto {
    budgetPeriodId: string;
    ministryId?: string | null;
    categoryId?: string | null;
    type: TransactionType;
    amount: number;
    notes?: string;
}
