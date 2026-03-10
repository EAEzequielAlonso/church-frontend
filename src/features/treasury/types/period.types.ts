export enum PeriodStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED'
}

export interface PeriodSnapshot {
    totalIncome: number;
    totalExpense: number;
    transactionCount: number;
    budgetedIncome: number;
    budgetedExpense: number;
}

export interface PeriodModel {
    id: string;
    churchId: string;
    year: number;
    month: number;
    status: PeriodStatus;
    closedAt?: string | null;
    closedByUserId?: string | null;
    snapshot: PeriodSnapshot | null;
    createdAt: string;
    updatedAt: string;
}
