import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { periodsApi } from '../api/periods.api';
import { PeriodStatus } from '../types/period.types';

export const periodKeys = {
    all: ['periods'] as const,
    detail: (churchId: string, year: number, month: number) => [...periodKeys.all, churchId, year, month] as const,
};

export function usePeriods(churchId: string, year: number, month: number) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: periodKeys.detail(churchId, year, month),
        queryFn: () => periodsApi.getPeriod(churchId, year, month),
        enabled: !!churchId && !!year && !!month,
    });

    const closeMutation = useMutation({
        mutationFn: (data: { churchId: string; year: number; month: number }) => periodsApi.closePeriod(data.churchId, data.year, data.month),
        onSuccess: (data, variables) => {
            // 1. Refrescar este período
            queryClient.invalidateQueries({ queryKey: periodKeys.detail(variables.churchId, variables.year, variables.month) });
            // 2. Refrescar transacciones ESPECÍFICAS de ese período (evita re-fetch de todo el historial)
            queryClient.invalidateQueries({ queryKey: ['transactions', variables.churchId, variables.year, variables.month] });
            // 3. Refrescar presupuesto y ejecución específicos
            queryClient.invalidateQueries({ queryKey: ['budgets', variables.churchId, variables.year, variables.month] });
            queryClient.invalidateQueries({ queryKey: ['budgetExecution', variables.churchId, variables.year, variables.month] });
        }
    });

    const reopenMutation = useMutation({
        mutationFn: (data: { churchId: string; year: number; month: number }) => periodsApi.reopenPeriod(data.churchId, data.year, data.month),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: periodKeys.detail(variables.churchId, variables.year, variables.month) });
            queryClient.invalidateQueries({ queryKey: ['transactions', variables.churchId, variables.year, variables.month] });
            queryClient.invalidateQueries({ queryKey: ['budgets', variables.churchId, variables.year, variables.month] });
            queryClient.invalidateQueries({ queryKey: ['budgetExecution', variables.churchId, variables.year, variables.month] });
        }
    });

    return {
        period: query.data,
        isLoading: query.isLoading,
        error: query.error,
        closePeriod: closeMutation.mutateAsync,
        isClosing: closeMutation.isPending,
        reopenPeriod: reopenMutation.mutateAsync,
        isReopening: reopenMutation.isPending
    };
}

// Hook Optimizado de Lectura Rápida para prevenir múltiples llamados
export function useIsPeriodClosed(churchId: string, year: number, month: number) {
    const { data, isLoading } = useQuery({
        queryKey: periodKeys.detail(churchId, year, month),
        queryFn: () => periodsApi.getPeriod(churchId, year, month),
        enabled: !!churchId && !!year && !!month,
        staleTime: 1000 * 60 * 5, // 5 minutos de caché fuerte
    });

    return {
        isClosed: data?.status === PeriodStatus.CLOSED,
        isLoading
    };
}
