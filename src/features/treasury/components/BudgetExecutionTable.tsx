import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useBudgetExecution } from '../hooks/useBudgetExecution';
import { useMinistries } from '../hooks/useMinistries';
import { useCategories } from '../hooks/useCategories';
import { BudgetExecutionStatus, BudgetLineType } from '../types/budget.types';
import { formatCurrency } from '../utils/currency';

interface BudgetExecutionTableProps {
    year: number;
    month: number;
}

// Removed inline formatCurrency

export function BudgetExecutionTable({ year, month }: BudgetExecutionTableProps) {
    const { churchId } = useAuth();
    const { executionData, isLoading, error } = useBudgetExecution(churchId || '', year, month);
    const { ministries } = useMinistries();
    const { categories: incomeCats } = useCategories('income');
    const { categories: expenseCats } = useCategories('expense');

    const allCategories = [...incomeCats, ...expenseCats];

    const ministryMap = useMemo(() => {
        const map = new Map<string, string>();
        ministries.forEach(m => map.set(m.id, m.name));
        return map;
    }, [ministries]);

    const categoryMap = useMemo(() => {
        const map = new Map<string, string>();
        allCategories.forEach(c => map.set(c.id, c.name));
        return map;
    }, [allCategories]);

    const getMinistryName = (id?: string | null) => {
        if (!id) return '-';
        return ministryMap.get(id) || 'Desconocido';
    };

    const getCategoryName = (id?: string | null) => {
        if (!id) return '-';
        return categoryMap.get(id) || 'Desconocido';
    };

    const getStatusBadge = (status: BudgetExecutionStatus) => {
        switch (status) {
            case BudgetExecutionStatus.OK:
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">OK</Badge>;
            case BudgetExecutionStatus.WARNING_80:
                return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Alerta (80%)</Badge>;
            case BudgetExecutionStatus.EXCEEDED:
                return <Badge variant="destructive">Superado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Ejecución Presupuestaria</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <p className="text-slate-500 text-sm font-medium">Cargando datos...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Ejecución Presupuestaria</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <p className="text-rose-500 text-sm font-medium">Error al cargar la ejecución.</p>
                </CardContent>
            </Card>
        );
    }

    if (!executionData || executionData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Ejecución Presupuestaria</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <p className="text-slate-500 text-sm font-medium">No hay presupuesto configurado para este mes.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ejecución Presupuestaria</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-slate-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Ministerio</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">Presupuestado</TableHead>
                                <TableHead className="text-right">Ejecutado</TableHead>
                                <TableHead className="w-[150px]">Progreso</TableHead>
                                <TableHead className="text-center w-[120px]">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {executionData.map((line, idx) => {
                                const isIncome = line.type === BudgetLineType.INCOME;

                                // Deterministic key for the iteration
                                // Optional chaining is not necessary since line properties exist even if undefined, 
                                // but we must ensure a string is joined safely.
                                // If the backend added "id" to execution lines in the future, we could prefer `line.id`.
                                const rowKey = `${line.type}-${line.ministryId || 'null'}-${line.categoryId || 'null'}`;

                                // Calculo de porcentaje (manejo estricto de div por cero)
                                const percentage = line.budgetedAmount > 0
                                    ? Math.round((line.executedAmount / line.budgetedAmount) * 100)
                                    : (line.executedAmount > 0 ? 100 : 0);

                                return (
                                    <TableRow key={rowKey} className="hover:bg-slate-50/50">
                                        <TableCell>
                                            <span className={`font-medium ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {isIncome ? 'Ingreso' : 'Egreso'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {getMinistryName(line.ministryId)}
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {getCategoryName(line.categoryId)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-700">
                                            {formatCurrency(line.budgetedAmount)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-700">
                                            {formatCurrency(line.executedAmount)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-xs text-slate-500">
                                                    <span>{percentage}%</span>
                                                </div>
                                                <Progress
                                                    value={Math.min(percentage, 100)}
                                                    className="h-2"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(line.status)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
