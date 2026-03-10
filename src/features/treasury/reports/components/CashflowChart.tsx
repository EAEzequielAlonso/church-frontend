import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCashflowReport } from '../hooks/useReports';
import { ReportFilters } from '../types/reports.types';
import { formatCurrency } from '../../utils/currency';

interface CashflowChartProps {
    filters: ReportFilters;
}

export function CashflowChart({ filters }: CashflowChartProps) {
    const { data: cashflow, isLoading, isError } = useCashflowReport(filters);

    if (isLoading) {
        return (
            <Card className="mb-6 shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Flujo de Caja</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-slate-50/50 animate-pulse rounded-md mx-6 mb-6">
                    <span className="text-sm text-slate-400">Cargando gráfico...</span>
                </CardContent>
            </Card>
        );
    }

    if (isError || !cashflow || cashflow.length === 0) {
        return (
            <Card className="mb-6 shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Flujo de Caja</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md mx-6 mb-6 border border-dashed border-slate-200">
                    <span className="text-sm text-slate-500">No hay datos de flujo de caja para este período.</span>
                </CardContent>
            </Card>
        );
    }

    // Transform data simply formatted dates for the X-axis if needed
    const chartData = cashflow.map(point => ({
        ...point,
        // Shorten ISO date to DD/MM or keep as is depending on API
        displayDate: point.date.split('T')[0],
    }));

    return (
        <Card className="mb-6 shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-lg">Flujo de Caja Cronológico</CardTitle>
                <CardDescription>Movimientos diarios de ingresos y egresos del período</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickFormatter={(val) => `$${val.toLocaleString()}`}
                            />
                            <Tooltip
                                formatter={(value: any) => formatCurrency(Number(value))}
                                labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                name="Ingresos"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                name="Egresos"
                                stroke="#f43f5e"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
