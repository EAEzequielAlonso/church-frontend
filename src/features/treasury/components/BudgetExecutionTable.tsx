import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBudgetExecution } from '../hooks/useBudgetExecution';
import { BudgetExecutionStatus } from '../types/budget.types';
import { formatCurrency } from '../utils/currency';

interface BudgetExecutionTableProps {
    periodId: string;
}

export function BudgetExecutionTable({ periodId }: BudgetExecutionTableProps) {
    const { executionData, isLoading, error } = useBudgetExecution(periodId);

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
                <CardHeader><CardTitle>Ejecución Presupuestaria</CardTitle></CardHeader>
                <CardContent className="flex justify-center py-8">
                    <p className="text-slate-500 text-sm font-medium">Cargando datos...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader><CardTitle>Ejecución Presupuestaria</CardTitle></CardHeader>
                <CardContent className="flex justify-center py-8">
                    <p className="text-rose-500 text-sm font-medium">Error al cargar la ejecución.</p>
                </CardContent>
            </Card>
        );
    }

    if (!executionData || executionData.allocations.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>Ejecución Presupuestaria</CardTitle></CardHeader>
                <CardContent className="flex justify-center py-8">
                    <p className="text-slate-500 text-sm font-medium">No hay asignaciones configuradas para este período.</p>
                </CardContent>
            </Card>
        );
    }

    const { coherence, allocations } = executionData;

    return (
        <div className="space-y-4">
            {/* Coherence Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <p className="text-xs text-slate-500 mb-1">Ingresos Presupuestados</p>
                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(coherence.totalIncomeBudgeted)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <p className="text-xs text-slate-500 mb-1">Ingresos Reales</p>
                        <p className="text-lg font-bold text-emerald-700">{formatCurrency(coherence.totalIncomeActual)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <p className="text-xs text-slate-500 mb-1">Gastos Presupuestados</p>
                        <p className="text-lg font-bold text-rose-600">{formatCurrency(coherence.totalExpenseBudgeted)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <p className="text-xs text-slate-500 mb-1">Gastos Reales</p>
                        <p className="text-lg font-bold text-rose-700">{formatCurrency(coherence.totalExpenseActual)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Balance */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <p className="text-xs text-slate-500 mb-1">Balance Proyectado</p>
                        <p className={`text-lg font-bold ${coherence.projectedBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(coherence.projectedBalance)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                        <p className="text-xs text-slate-500 mb-1">Balance Real</p>
                        <p className={`text-lg font-bold ${coherence.actualBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(coherence.actualBalance)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Execution Table */}
            <Card>
                <CardHeader><CardTitle>Detalle por Asignación</CardTitle></CardHeader>
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
                                    <TableHead className="text-right">Restante</TableHead>
                                    <TableHead className="w-[150px]">Progreso</TableHead>
                                    <TableHead className="text-center w-[120px]">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allocations.map((alloc) => {
                                    const isIncome = alloc.type === 'income';
                                    const percentage = Math.min(Math.round(alloc.usagePercentage), 999);

                                    return (
                                        <TableRow key={alloc.allocationId} className="hover:bg-slate-50/50">
                                            <TableCell>
                                                <span className={`font-medium ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {isIncome ? 'Ingreso' : 'Egreso'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {alloc.ministry?.name || '-'}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {alloc.category?.name || '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-700">
                                                {formatCurrency(alloc.allocatedAmount)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-700">
                                                {formatCurrency(alloc.executedAmount)}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${alloc.remainingAmount < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                                {formatCurrency(alloc.remainingAmount)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                                        <span>{percentage}%</span>
                                                    </div>
                                                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(alloc.status as BudgetExecutionStatus)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
