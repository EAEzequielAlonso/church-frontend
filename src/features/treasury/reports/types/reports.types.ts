export interface SummaryReport {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    incomeChangePercent?: number;
    expenseChangePercent?: number;
}

export interface CashflowPoint {
    date: string; // ISO date string or formatted date
    income: number;
    expense: number;
    balance: number;
}

export interface BreakdownItem {
    id: string; // Category ID or Ministry ID
    name: string;
    amount: number;
    percentage: number;
}

export interface TrendPoint {
    period: string; // e.g., '2024-01', 'Ene 24'
    income: number;
    expense: number;
    balance: number;
}

// Optional: You could define the filter interface here as well
export interface ReportFilters {
    churchId: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
    ministryId?: string;
    categoryId?: string;
}
