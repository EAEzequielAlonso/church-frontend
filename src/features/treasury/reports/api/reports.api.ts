import { fetchWithAuth, buildQueryString } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { SummaryReport, CashflowPoint, BreakdownItem, TrendPoint, ReportFilters } from '../types/reports.types';

export const reportsApi = {
    getSummary: (filters: ReportFilters): Promise<SummaryReport> =>
        fetchWithAuth<SummaryReport>(`/treasury/reports/summary${buildQueryString(filters)}`),

    getCashflow: (filters: ReportFilters): Promise<CashflowPoint[]> =>
        fetchWithAuth<CashflowPoint[]>(`/treasury/reports/cashflow${buildQueryString(filters)}`),

    getCategoryBreakdown: (filters: ReportFilters): Promise<BreakdownItem[]> =>
        fetchWithAuth<BreakdownItem[]>(`/treasury/reports/category-breakdown${buildQueryString(filters)}`),

    getMinistryBreakdown: (filters: ReportFilters): Promise<BreakdownItem[]> =>
        fetchWithAuth<BreakdownItem[]>(`/treasury/reports/ministry-breakdown${buildQueryString(filters)}`),

    getTrend: (filters: ReportFilters): Promise<TrendPoint[]> =>
        fetchWithAuth<TrendPoint[]>(`/treasury/reports/trend${buildQueryString(filters)}`),
};
