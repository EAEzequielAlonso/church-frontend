
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TreasuryTransactionModel, TransactionStatus } from "../types/treasury.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TreasurySummaryCards } from "./TreasurySummaryCards";

interface TreasuryStatsProps {
    transactions: TreasuryTransactionModel[];
}

export function TreasuryStats({ transactions }: TreasuryStatsProps) {
    // Prepare chart data (Group by month)
    const chartData = transactions.reduce((acc, t) => {
        const month = format(t.date, 'dd MMM', { locale: es }); // Group by day for detailed report, or MMM for monthly.
        // If range is large, MMM is better. If range is small, dd MMM is better.
        // keeping logic simple for now: aggregating by label.

        const existing = acc.find(item => item.name === month);
        if (existing) {
            if (t.isIncome) existing.ingresos += t.amount;
            if (t.isExpense) existing.egresos += t.amount;
        } else {
            acc.push({
                name: month,
                ingresos: t.isIncome ? t.amount : 0,
                egresos: t.isExpense ? t.amount : 0
            });
        }
        return acc;
    }, [] as { name: string; ingresos: number; egresos: number }[]);

    return (
        <div className="space-y-4">
            <TreasurySummaryCards transactions={transactions} />

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
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
                                formatter={(value: any) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value))}
                            />
                            <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
