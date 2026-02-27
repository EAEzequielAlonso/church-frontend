
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

interface CashflowChartProps {
    data?: any[];
    isLoading: boolean;
}

export function CashflowChart({ data, isLoading }: CashflowChartProps) {
    if (isLoading) {
        return <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse"></div>
    }

    // Transform data strings to numbers if needed (API returns strings for decimals usually)
    const chartData = data?.map(d => ({
        month: d.month,
        ingresos: parseFloat(d.income),
        gastos: parseFloat(d.expense)
    })) || [];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="gastos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
        </ResponsiveContainer>
    )
}
