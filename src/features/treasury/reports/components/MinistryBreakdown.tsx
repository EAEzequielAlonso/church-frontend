import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useMinistryBreakdown } from '../hooks/useReports';
import { ReportFilters } from '../types/reports.types';
import { formatCurrency } from '../../utils/currency';

interface MinistryBreakdownProps {
    filters: ReportFilters;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#ec4899', '#10b981', '#f43f5e', '#64748b'];

export function MinistryBreakdown({ filters }: MinistryBreakdownProps) {
    const { data: breakdown, isLoading, isError } = useMinistryBreakdown(filters);

    if (isLoading) {
        return (
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Distribución por Ministerio</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-slate-50/50 animate-pulse rounded-md mx-6 mb-6">
                </CardContent>
            </Card>
        );
    }

    if (isError || !breakdown || breakdown.length === 0) {
        return (
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Distribución por Ministerio</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md mx-6 mb-6 border border-dashed border-slate-200">
                    <span className="text-sm text-slate-500">Sin datos registrados.</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-lg">Distribución por Ministerio</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={breakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="amount"
                                nameKey="name"
                            >
                                {breakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value: any, name: any, props: any) => [
                                    formatCurrency(Number(value)),
                                    `${name} (${props.payload.percentage.toFixed(1)}%)`
                                ]}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
