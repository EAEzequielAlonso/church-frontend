"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ReportsFilters } from '@/features/treasury/reports/components/ReportsFilters';
import { SummaryCards } from '@/features/treasury/reports/components/SummaryCards';
import { CashflowChart } from '@/features/treasury/reports/components/CashflowChart';
import { CategoryBreakdown } from '@/features/treasury/reports/components/CategoryBreakdown';
import { MinistryBreakdown } from '@/features/treasury/reports/components/MinistryBreakdown';
import { TrendChart } from '@/features/treasury/reports/components/TrendChart';
import { ReportFilters as ReportFiltersType } from '@/features/treasury/reports/types/reports.types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TreasuryReportsPage() {
    const { churchId } = useAuth();
    const router = useRouter();

    const today = new Date();
    // Por defecto, mostramos los últimos 3 meses incluyendo el actual
    const defaultStartDate = startOfMonth(subMonths(today, 2));
    const defaultEndDate = endOfMonth(today);

    // Estado centralizado para todos los reportes
    const [filters, setFilters] = useState<ReportFiltersType>({
        churchId: churchId || '',
        startDate: format(defaultStartDate, 'yyyy-MM-dd'),
        endDate: format(defaultEndDate, 'yyyy-MM-dd'),
        ministryId: undefined,
        categoryId: undefined,
    });

    // Validamos que exista churchId (puede que demore un instante en cargar del AuthContext)
    if (!churchId) {
        return <div className="p-8 text-center text-slate-500">Cargando sesión...</div>;
    }

    // Aseguramos que el churchId esté siempre sincronizado si cambia (ej. múltiples iglesias)
    const effectiveFilters = { ...filters, churchId };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.push('/treasury')} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reportes Financieros</h2>
                    <p className="text-slate-500">Analítica avanzada y estado en tiempo real de la tesorería.</p>
                </div>
            </div>

            {/* Controles de Filtrado */}
            <ReportsFilters
                filters={effectiveFilters}
                onFiltersChange={setFilters}
            />

            {/* Indicadores Clave (KPIs) */}
            <SummaryCards filters={effectiveFilters} />

            {/* Gráfico Principal de Flujo de Caja */}
            <CashflowChart filters={effectiveFilters} />

            {/* Desgloses (Donuts) - Mitad y Mitad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CategoryBreakdown filters={effectiveFilters} />
                <MinistryBreakdown filters={effectiveFilters} />
            </div>

            {/* Evolución Temporal de Tendencia (Barras) */}
            <TrendChart filters={effectiveFilters} />

        </div>
    );
}
