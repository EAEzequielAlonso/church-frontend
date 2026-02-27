
"use client"

import { ArrowDown, ArrowUp, DollarSign, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryData {
    income: { value: number; previous: number; change: number };
    expense: { value: number; previous: number; change: number };
    net: { value: number; previous: number; change: number };
}

interface ReportsSummaryProps {
    data?: SummaryData;
    isLoading: boolean;
}

export function ReportsSummary({ data, isLoading }: ReportsSummaryProps) {
    if (isLoading) {
        return (
            <>
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </>
        )
    }

    if (!data) return null;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
    };

    const ResultIcon = data.net.value >= 0 ? TrendingUp : TrendingDown;
    const ResultColor = data.net.value >= 0 ? "text-green-500" : "text-red-500";

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.income.value)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {data.income.change > 0 ? "+" : ""}{data.income.change.toFixed(1)}% vs periodo anterior
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                    <ArrowDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.expense.value)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {data.expense.change > 0 ? "+" : ""}{data.expense.change.toFixed(1)}% vs periodo anterior
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resultado Neto</CardTitle>
                    <ResultIcon className={`h-4 w-4 ${ResultColor}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${ResultColor}`}>{formatCurrency(data.net.value)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Flujo de caja neto
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary-foreground/90">Balance Disponible</CardTitle>
                    <Wallet className="h-4 w-4 text-primary-foreground/90" />
                </CardHeader>
                <CardContent>
                    {/* This would be real total balance across all asset accounts, or just 'Savings' */}
                    <div className="text-2xl font-bold">Consolidado</div>
                    <p className="text-xs text-primary-foreground/80 mt-1">
                        Ver desglose por cuenta
                    </p>
                </CardContent>
            </Card>
        </>
    )
}
