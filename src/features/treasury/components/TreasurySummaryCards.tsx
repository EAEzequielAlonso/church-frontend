
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon, TrendingUpIcon } from "lucide-react";
import { TreasuryTransactionModel, TransactionStatus } from "../types/treasury.types";

interface TreasurySummaryCardsProps {
    transactions: TreasuryTransactionModel[];
}

export function TreasurySummaryCards({ transactions }: TreasurySummaryCardsProps) {
    const income = transactions
        .filter(t => t.isIncome && t.status === TransactionStatus.COMPLETED)
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.isExpense && t.status === TransactionStatus.COMPLETED)
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                    <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(balance)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(income)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Egresos</CardTitle>
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(expense)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                    <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{transactions.length}</div>
                </CardContent>
            </Card>
        </div>
    );
}
