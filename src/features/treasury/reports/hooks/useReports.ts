import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import { ReportFilters } from '../types/reports.types';

export const reportsKeys = {
    all: ['reports'] as const,
    summary: (filters: ReportFilters) => [...reportsKeys.all, 'summary', filters] as const,
    cashflow: (filters: ReportFilters) => [...reportsKeys.all, 'cashflow', filters] as const,
    categoryBreakdown: (filters: ReportFilters) => [...reportsKeys.all, 'categoryBreakdown', filters] as const,
    ministryBreakdown: (filters: ReportFilters) => [...reportsKeys.all, 'ministryBreakdown', filters] as const,
    trend: (filters: ReportFilters) => [...reportsKeys.all, 'trend', filters] as const,
};

// Check if basic mandatory filters are present to avoid premature fetch
const hasRequiredFilters = (filters: ReportFilters) => !!filters.churchId && !!filters.startDate && !!filters.endDate;

export function useSummaryReport(filters: ReportFilters) {
    return useQuery({
        queryKey: reportsKeys.summary(filters),
        queryFn: () => reportsApi.getSummary(filters),
        enabled: hasRequiredFilters(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCashflowReport(filters: ReportFilters) {
    return useQuery({
        queryKey: reportsKeys.cashflow(filters),
        queryFn: () => reportsApi.getCashflow(filters),
        enabled: hasRequiredFilters(filters),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCategoryBreakdown(filters: ReportFilters) {
    return useQuery({
        queryKey: reportsKeys.categoryBreakdown(filters),
        queryFn: () => reportsApi.getCategoryBreakdown(filters),
        enabled: hasRequiredFilters(filters),
        staleTime: 1000 * 60 * 5,
    });
}

export function useMinistryBreakdown(filters: ReportFilters) {
    return useQuery({
        queryKey: reportsKeys.ministryBreakdown(filters),
        queryFn: () => reportsApi.getMinistryBreakdown(filters),
        enabled: hasRequiredFilters(filters),
        staleTime: 1000 * 60 * 5,
    });
}

export function useTrendReport(filters: ReportFilters) {
    return useQuery({
        queryKey: reportsKeys.trend(filters),
        queryFn: () => reportsApi.getTrend(filters),
        enabled: hasRequiredFilters(filters),
        staleTime: 1000 * 60 * 5,
    });
}
