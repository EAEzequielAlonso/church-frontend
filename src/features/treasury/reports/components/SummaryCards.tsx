import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRightLeft, DollarSign } from 'lucide-react';
import { useSummaryReport } from '../hooks/useReports';
import { ReportFilters } from '../types/reports.types';
import { formatCurrency } from '../../utils/currency';

interface SummaryCardsProps {
    filters: ReportFilters;
}

export function SummaryCards({ filters }: SummaryCardsProps) {
    const { data: summary, isLoading, isError } = useSummaryReport(filters);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="animate-pulse bg-slate-50/50">
                        <CardContent className="h-24 p-6" />
                    </Card>
                ))}
            </div>
        );
    }

    if (isError || !summary) {
        return (
            <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
                Hubo un error al cargar el resumen financiero.
            </div>
        );
    }

    const { totalIncome, totalExpense, balance, transactionCount, incomeChangePercent, expenseChangePercent } = summary;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-emerald-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500">Total Ingresos</p>
                            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    {incomeChangePercent !== undefined && (
                        <div className="mt-4 flex items-center text-xs">
                            <span className={`font-medium ${incomeChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {incomeChangePercent > 0 ? '+' : ''}{incomeChangePercent}%
                            </span>
                            <span className="text-slate-400 ml-1">vs período ant.</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-rose-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500">Total Egresos</p>
                            <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalExpense)}</p>
                        </div>
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                    {expenseChangePercent !== undefined && (
                        <div className="mt-4 flex items-center text-xs">
                            <span className={`font-medium ${expenseChangePercent <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {expenseChangePercent > 0 ? '+' : ''}{expenseChangePercent}%
                            </span>
                            <span className="text-slate-400 ml-1">vs período ant.</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500">Balance Neto</p>
                            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                {formatCurrency(balance)}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-slate-400">Flujo libre en el período</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500">Transacciones</p>
                            <p className="text-2xl font-bold text-slate-700">{transactionCount}</p>
                        </div>
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-slate-400">Operaciones en el período</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
