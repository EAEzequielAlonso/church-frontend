
"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CategoryData {
    name: string;
    value: number;
    color?: string;
}

interface CategoryBreakdownProps {
    incomeData?: CategoryData[];
    expenseData?: CategoryData[];
    isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function CategoryBreakdown({ incomeData, expenseData, isLoading }: CategoryBreakdownProps) {
    if (isLoading) {
        return <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse"></div>
    }

    const renderChart = (data: CategoryData[] | undefined) => {
        if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

        const processedData = data.map((d, index) => ({
            ...d,
            value: parseFloat(d.value as any), // Ensure number
            fill: d.color || COLORS[index % COLORS.length]
        }));

        return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={processedData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {processedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `$${value}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    return (
        <Tabs defaultValue="expenses" className="w-full">
            <div className="flex items-center justify-between mb-4">
                <TabsList>
                    <TabsTrigger value="expenses">Gastos</TabsTrigger>
                    <TabsTrigger value="income">Ingresos</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="expenses" className="space-y-4">
                {renderChart(expenseData)}
            </TabsContent>
            <TabsContent value="income" className="space-y-4">
                {renderChart(incomeData)}
            </TabsContent>
        </Tabs>
    )
}
