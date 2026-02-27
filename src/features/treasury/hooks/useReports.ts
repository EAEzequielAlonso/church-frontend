
import useSWR from 'swr';
import {
    getReportsSummary,
    getCashflowReport,
    getCategoryBreakdown,
    getMinistryBreakdown,
    getAccountBalances,
    getTrendAnalysis
} from '../api/reports.api';

// Keys for SWR
const REPORTS_KEYS = {
    SUMMARY: 'reports/summary',
    CASHFLOW: 'reports/cashflow',
    CATEGORIES: 'reports/categories',
    MINISTRIES: 'reports/ministries',
    ACCOUNTS: 'reports/accounts',
    TRENDS: 'reports/trends',
};

export function useReportsSummary(startDate: Date, endDate: Date) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const { data, error, isLoading } = useSWR(
        [REPORTS_KEYS.SUMMARY, start, end],
        () => getReportsSummary(start, end)
    );

    return {
        summary: data,
        isLoading,
        isError: error
    };
}

export function useReportsCashflow(startDate: Date, endDate: Date) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const { data, error, isLoading } = useSWR(
        [REPORTS_KEYS.CASHFLOW, start, end],
        () => getCashflowReport(start, end)
    );

    return {
        cashflow: data,
        isLoading,
        isError: error
    };
}

export function useReportsBreakdown(startDate: Date, endDate: Date) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const { data: incomeCategories, isLoading: incomeLoading } = useSWR(
        [REPORTS_KEYS.CATEGORIES, start, end, 'INCOME'],
        () => getCategoryBreakdown(start, end, 'INCOME')
    );

    const { data: expenseCategories, isLoading: expenseLoading } = useSWR(
        [REPORTS_KEYS.CATEGORIES, start, end, 'EXPENSE'],
        () => getCategoryBreakdown(start, end, 'EXPENSE')
    );

    const { data: ministryExpenses, isLoading: ministryLoading } = useSWR(
        [REPORTS_KEYS.MINISTRIES, start, end],
        () => getMinistryBreakdown(start, end)
    );

    return {
        incomeCategories,
        expenseCategories,
        ministryExpenses,
        isLoading: incomeLoading || expenseLoading || ministryLoading
    };
}

export function useReportsGeneral() {
    const { data: accounts, isLoading: accountsLoading } = useSWR(
        REPORTS_KEYS.ACCOUNTS,
        getAccountBalances
    );

    const { data: trends, isLoading: trendsLoading } = useSWR(
        [REPORTS_KEYS.TRENDS, 12],
        () => getTrendAnalysis(12)
    );

    return {
        accounts,
        trends,
        isLoading: accountsLoading || trendsLoading
    };
}
