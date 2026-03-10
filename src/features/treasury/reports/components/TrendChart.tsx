import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTrendReport } from '../hooks/useReports';
import { ReportFilters } from '../types/reports.types';
import { formatCurrency } from '../../utils/currency';

interface TrendChartProps {
    filters: ReportFilters;
}

export function TrendChart({ filters }: TrendChartProps) {
    const { data: trend, isLoading, isError } = useTrendReport(filters);

    if (isLoading) {
        return (
            <Card className="mb-6 shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Evolución Mensual</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center bg-slate-50/50 animate-pulse rounded-md mx-6 mb-6">
                    <span className="text-sm text-slate-400">Cargando gráfico...</span>
                </CardContent>
            </Card>
        );
    }

    if (isError || !trend || trend.length === 0) {
        return (
            <Card className="mb-6 shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Evolución Mensual</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center bg-slate-50 rounded-md mx-6 mb-6 border border-dashed border-slate-200">
                    <span className="text-sm text-slate-500">No hay datos de evolución para este reporte.</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6 shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-lg">Evolución Comparativa Mensual</CardTitle>
                <CardDescription>Ingresos vs Egresos agrupados por período</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={trend}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="period"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 13, fill: '#64748b' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickFormatter={(val) => `$${val.toLocaleString()}`}
                            />
                            <RechartsTooltip
                                formatter={(value: any) => formatCurrency(Number(value))}
                                labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '8px' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
                            <Bar
                                dataKey="income"
                                name="Ingresos"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            />
                            <Bar
                                dataKey="expense"
                                name="Egresos"
                                fill="#f43f5e"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
