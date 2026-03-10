export enum BudgetLineType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export interface BudgetLine {
    id: string;
    budgetId: string;
    type: BudgetLineType;
    ministryId?: string | null;
    categoryId?: string | null;
    budgetedAmount: number;
}

export interface BudgetModel {
    id: string;
    churchId: string;
    year: number;
    month: number;
    projectedIncomeTotal: number;
    notes?: string | null;
    createdAt?: string;
    lines: BudgetLine[];
}

export enum BudgetExecutionStatus {
    OK = 'OK',
    WARNING_80 = 'WARNING_80',
    EXCEEDED = 'EXCEEDED'
}

export interface BudgetExecutionLine {
    type: BudgetLineType;
    ministryId?: string | null;
    categoryId?: string | null;
    budgetedAmount: number;
    executedAmount: number;
    status: BudgetExecutionStatus;
}

export type BudgetExecutionResponse = BudgetExecutionLine[];

export interface CreateBudgetDto {
    churchId: string;
    year: number;
    month: number;
    projectedIncomeTotal: number;
    notes?: string;
    lines: Array<{
        type: BudgetLineType;
        ministryId?: string | null;
        categoryId?: string | null;
        budgetedAmount: number;
    }>;
}
