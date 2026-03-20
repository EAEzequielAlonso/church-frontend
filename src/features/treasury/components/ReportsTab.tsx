"use client"

import { useState } from "react"
import { startOfMonth, endOfMonth } from "date-fns"
import { useReportsSummary, useReportsCashflow, useReportsBreakdown } from "../hooks/useReports"
import { useTransactions } from "../hooks/useTransactions"
import { useAccounts } from "../hooks/useAccounts"
import { useAuth } from "@/context/AuthContext"
import { ReportsSummary } from "./reports/ReportsSummary"
import { CashflowChart } from "./reports/CashflowChart"
import { CategoryBreakdown } from "./reports/CategoryBreakdown"
import { ReportsFilters } from "./reports/ReportsFilters"
import { generateTreasuryPdf } from "../utils/generateTreasuryPdf"
import { toast } from "sonner"

import { TransactionsTable } from "./TransactionsTable"

import { useEffect } from "react"

interface ReportsTabProps {
    initialDates?: { start: Date; end: Date };
}

export function ReportsTab({ initialDates }: ReportsTabProps) {
    const { churchId, user } = useAuth();
    const [startDate, setStartDate] = useState(initialDates?.start || startOfMonth(new Date()))
    const [endDate, setEndDate] = useState(initialDates?.end || endOfMonth(new Date()))
    const [isExporting, setIsExporting] = useState(false);
    const [page, setPage] = useState(1)

    // Sync with initialDates if they change externally (e.g. from PeriodsTab navigation)
    useEffect(() => {
        if (initialDates) {
            setStartDate(initialDates.start);
            setEndDate(initialDates.end);
            setPage(1);
        }
    }, [initialDates]);

    const { summary, isLoading: isSummaryLoading } = useReportsSummary(startDate, endDate)
    const { cashflow, isLoading: isCashflowLoading } = useReportsCashflow(startDate, endDate)
    const { 
        incomeCategories, 
        expenseCategories, 
        isLoading: isBreakdownLoading 
    } = useReportsBreakdown(startDate, endDate)
    
    // Transactions with pagination for the report view
    const { transactions: paginatedTransactions, isLoading: isLoadingTx } = useTransactions({ 
        startDate, 
        endDate, 
        includeHistory: false,
        page,
        limit: 10
    });
    
    // Standard full list for PDF export remains the same
    const { transactions: allTransactions } = useTransactions({ startDate, endDate, includeHistory: false });
    const { accounts } = useAccounts();

    const handleDateChange = (start: Date, end: Date) => {
        setStartDate(start)
        setEndDate(end)
        setPage(1) // Reset page on date change
    }

    const handlePdfExport = async () => {
        if (!summary || !allTransactions) return;
        
        setIsExporting(true);
        try {
            await generateTreasuryPdf({
                churchName: user?.email ? `Iglesia (${user.email.split('@')[0]})` : "Tesorería Central",
                startDate,
                endDate,
                summary: {
                    income: summary.income.value,
                    expense: summary.expense.value,
                    net: summary.net.value,
                },
                transactions: allTransactions,
                incomeCategories: (incomeCategories as any[]) || [],
                expenseCategories: (expenseCategories as any[]) || [],
                accounts: (accounts as any[]) || [],
            });
            toast.success("Reporte PDF generado correctamente");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Error al generar el PDF");
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Reportes de Tesorería</h2>
                <p className="text-muted-foreground">
                    Visualiza el rendimiento financiero y el flujo de caja de tu iglesia.
                </p>
            </div>

            <ReportsFilters 
                startDate={startDate} 
                endDate={endDate} 
                onDateChange={handleDateChange} 
                onPdfExport={handlePdfExport}
                isExporting={isExporting}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ReportsSummary 
                    data={summary} 
                    isLoading={isSummaryLoading} 
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="md:col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">Flujo de Caja Mensual</h3>
                        <CashflowChart 
                            data={cashflow} 
                            isLoading={isCashflowLoading} 
                        />
                    </div>
                </div>

                <div className="md:col-span-3 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">Distribución por Categoría</h3>
                        <CategoryBreakdown 
                            incomeData={incomeCategories} 
                            expenseData={expenseCategories} 
                            isLoading={isBreakdownLoading} 
                        />
                    </div>
                </div>
            </div>

            {/* Listado de movimientos del periodo del reporte */}
            <div className="rounded-xl border bg-card text-card-foreground shadow mt-8">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-tight">Detalle de Movimientos del Período</h3>
                    <TransactionsTable
                        transactions={paginatedTransactions}
                        canEdit={false} // Read only in reports
                        page={page}
                        totalPages={paginatedTransactions?.meta?.lastPage || 1}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    )
}
