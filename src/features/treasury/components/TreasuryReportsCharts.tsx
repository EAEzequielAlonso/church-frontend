
import { useMemo } from 'react';
import { TreasuryTransactionModel } from "../types/treasury.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface Budget {
    id: string;
    amount: number;
    year: number;
    month: number;
    categoryId?: string;
    ministryId?: string;
}

interface TreasuryReportsChartsProps {
    transactions: TreasuryTransactionModel[];
    budgets: Budget[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c'];

export function TreasuryReportsCharts({ transactions, budgets }: TreasuryReportsChartsProps) {

    const { monthlyStats, categoryData, ministryData, budgetComparison } = useMemo(() => {
        // 1. Data for Monthly Bar Chart (Income vs Expense)
        const monthlyMap = new Map<string, { name: string, Ingresos: number, Egresos: number }>();

        transactions.forEach(t => {
            if (t.deletedAt) return;
            if (!t.date) return;

            const date = parseISO(t.date.toString()); // Ensure string handled
            if (isNaN(date.getTime())) return; // Skip invalid dates

            const monthKey = format(date, 'yyyy-MM');
            const montLabel = format(date, 'MMM yyyy', { locale: es });

            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { name: montLabel, Ingresos: 0, Egresos: 0 });
            }

            const req = monthlyMap.get(monthKey)!;
            if (t.isIncome) req.Ingresos += t.amount;
            if (t.isExpense) req.Egresos += t.amount;
        });

        // Sort by key (yyyy-MM) but return values
        const monthlyStats = Array.from(monthlyMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(entry => entry[1]);


        // 2. Expenses by Category
        const catMap: Record<string, number> = {};
        // 3. Expenses by Ministry
        const minMap: Record<string, number> = {};

        // 4. Budget vs Actual Logic
        let totalExpense = 0;

        // Date range of transactions to filter budgets
        const txDates = transactions.map(t => new Date(t.date).getTime());
        const minDate = txDates.length ? new Date(Math.min(...txDates)) : new Date();
        const maxDate = txDates.length ? new Date(Math.max(...txDates)) : new Date();

        transactions.forEach(t => {
            if (t.isExpense && !t.deletedAt) {
                totalExpense += t.amount;

                // Category
                const catName = t.categoryName || 'Sin Categoría';
                catMap[catName] = (catMap[catName] || 0) + t.amount;

                // Ministry
                const minName = t.ministryName || 'Sin Ministerio';
                minMap[minName] = (minMap[minName] || 0) + t.amount;
            }
        });

        const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        const ministryData = Object.entries(minMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        // Budget Sum
        let totalBudget = 0;
        budgets.forEach(b => {
            // Check if budget month is within transaction range.
            const budgetDate = new Date(b.year, b.month - 1, 15); // Middle of month
            if (isWithinInterval(budgetDate, { start: startOfMonth(minDate), end: endOfMonth(maxDate) })) {
                totalBudget += Number(b.amount);
            }
        });

        const budgetComparison = [
            { name: 'Presupuestado', value: totalBudget },
            { name: 'Ejecutado', value: totalExpense }
        ];

        return { monthlyStats, categoryData, ministryData, budgetComparison };
    }, [transactions, budgets]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Progress */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Evolución Mensual</CardTitle>
                    <CardDescription>Ingresos vs Egresos por mes</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                            <Legend />
                            <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Bar dataKey="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Expenses by Category */}
            <Card>
                <CardHeader>
                    <CardTitle>Gastos por Categoría</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Expenses by Ministry */}
            <Card>
                <CardHeader>
                    <CardTitle>Gastos por Ministerio</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={ministryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {ministryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Budget vs Actual */}
            <Card>
                <CardHeader>
                    <CardTitle>Presupuesto vs Ejecución</CardTitle>
                    <CardDescription>Comparativa del periodo seleccionado</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={budgetComparison} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tickFormatter={(val) => `$${val / 1000}k`} />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                            <Bar dataKey="value" name="Monto" radius={[0, 4, 4, 0]}>
                                {budgetComparison.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Presupuestado' ? '#8884d8' : entry.value > budgetComparison[0].value ? '#ef4444' : '#10b981'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
