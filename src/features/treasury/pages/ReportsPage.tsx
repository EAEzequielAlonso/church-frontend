"use client"

import { useState } from "react"
import { startOfMonth, endOfMonth } from "date-fns"
import { ReportsFilters } from "../components/reports/ReportsFilters"
import { ReportsSummary } from "../components/reports/ReportsSummary"
import { CashflowChart } from "../components/reports/CashflowChart"
import { CategoryBreakdown } from "../components/reports/CategoryBreakdown"
import { useReportsSummary, useReportsCashflow, useReportsBreakdown, useReportsGeneral } from "../hooks/useReports"

export default function ReportsPage() {
    const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
    const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

    const handleDateChange = (start: Date, end: Date) => {
        setStartDate(start);
        setEndDate(end);
    };

    // Fetch Data
    const { summary, isLoading: summaryLoading } = useReportsSummary(startDate, endDate);
    const { cashflow, isLoading: cashflowLoading } = useReportsCashflow(startDate, endDate);
    const { incomeCategories, expenseCategories, isLoading: breakdownLoading } = useReportsBreakdown(startDate, endDate);
    const { accounts, isLoading: accountsLoading } = useReportsGeneral();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Reportes Financieros
                </h1>
                <p className="text-muted-foreground mt-1">
                    Análisis detallado de ingresos, egresos y flujo de caja en moneda base.
                </p>
            </div>

            <ReportsFilters
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportsSummary data={summary} isLoading={summaryLoading} />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-card rounded-xl border shadow-sm min-h-[400px]">
                    <h3 className="text-lg font-semibold mb-6">Flujo de Caja (Mensual)</h3>
                    <CashflowChart data={cashflow} isLoading={cashflowLoading} />
                </div>
                <div className="p-6 bg-card rounded-xl border shadow-sm min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-6">Desglose por Categoría</h3>
                    <CategoryBreakdown
                        incomeData={incomeCategories}
                        expenseData={expenseCategories}
                        isLoading={breakdownLoading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Balances */}
                <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Balances de Cuentas (Activos)</h3>
                    {accountsLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {accounts?.map((acc: any) => (
                                <div key={acc.id} className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-lg transition-colors border-b last:border-0 border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                            {acc.currency}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{acc.name}</p>
                                            <p className="text-xs text-muted-foreground">Cuenta {acc.type}</p>
                                        </div>
                                    </div>
                                    <div className="font-bold">
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: acc.currency }).format(acc.balance)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Trends / Placeholder for more */}
                <div className="p-6 bg-card rounded-xl border shadow-sm flex items-center justify-center text-muted-foreground bg-muted/20">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Próximamente: Análisis de Tendencias AI</h3>
                        <p className="text-sm max-w-xs mx-auto">Esta sección utilizará modelos predictivos para estimar el flujo de caja futuro.</p>
                    </div>
                </div>
            </div>

        </div>
    )
}
