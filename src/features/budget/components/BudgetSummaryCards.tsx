import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetExecutionSummary } from "../types/budget.types";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, Wallet, AlertCircle } from "lucide-react";

interface Props {
    summary: BudgetExecutionSummary;
    isLoading: boolean;
}

export function BudgetSummaryCards({ summary, isLoading }: Props) {
    if (isLoading) {
        return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-32 bg-gray-200 rounded"></div>
                    </CardContent>
                </Card>
            ))}
        </div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</div>
                    <p className="text-xs text-muted-foreground">Asignado para el periodo</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ejecutado</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</div>
                    <p className="text-xs text-muted-foreground">Gastos reales registrados</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Disponible</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {/* Color logic: Red if negative */}
                    <div className={`text-2xl font-bold ${summary.remaining < 0 ? "text-red-500" : ""}`}>
                        {formatCurrency(summary.remaining)}
                    </div>
                    <p className="text-xs text-muted-foreground">Restante por ejecutar</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ejecución</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${summary.usagePercentage > 100 ? "text-red-500" : ""}`}>
                        {summary.usagePercentage.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Del presupuesto total</p>
                </CardContent>
            </Card>
        </div>
    );
}
