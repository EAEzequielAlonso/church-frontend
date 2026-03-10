import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBudgets } from '../hooks/useBudgets';
import { useBudgetExecution } from '../hooks/useBudgetExecution';
import { BudgetDialog } from './BudgetDialog';
import { BudgetExecutionTable } from './BudgetExecutionTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertCircle, Info, PlusCircle, Lock } from 'lucide-react';
import { BudgetExecutionStatus, BudgetLineType } from '../types/budget.types';
import { useIsPeriodClosed } from '../hooks/usePeriods';

export function BudgetsTab() {
    const { churchId } = useAuth();
    const currentDate = new Date();
    const [year, setYear] = useState<number>(currentDate.getFullYear());
    const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { budgets, isLoading: isLoadingBudgets } = useBudgets(churchId || '', year, month);
    const { executionData, isLoading: isLoadingExec } = useBudgetExecution(churchId || '', year, month);
    const { isClosed: isPeriodClosed } = useIsPeriodClosed(churchId || '', year, month);

    const hasBudget = budgets && budgets.length > 0;
    const currentBudget = hasBudget ? budgets[0] : null;

    // Calculamos si hay alertas de ejecución
    const { isExceeded, isWarning, hasGlobalExceeded } = useMemo(() => {
        if (!hasBudget || !executionData) return { isExceeded: false, isWarning: false, hasGlobalExceeded: false };

        let totalExecutedExpenses = 0;
        let anyExceeded = false;
        let anyWarning = false;

        executionData.forEach(line => {
            if (line.type === BudgetLineType.EXPENSE) {
                totalExecutedExpenses += line.executedAmount;
            }
            if (line.status === BudgetExecutionStatus.EXCEEDED) anyExceeded = true;
            if (line.status === BudgetExecutionStatus.WARNING_80) anyWarning = true;
        });

        const globalExceeded = currentBudget ? totalExecutedExpenses > currentBudget.projectedIncomeTotal : false;

        return {
            isExceeded: anyExceeded,
            isWarning: anyWarning,
            hasGlobalExceeded: globalExceeded
        };
    }, [hasBudget, executionData, currentBudget]);

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <div className="space-y-6">
            {/* Cabecera y Controles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                        <SelectTrigger className="w-[140px] bg-slate-50">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-[100px] bg-slate-50"
                    />
                </div>

                {!hasBudget && !isLoadingBudgets && (
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90" disabled={isPeriodClosed} title={isPeriodClosed ? "Período cerrado" : "Nuevo Presupuesto"}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Presupuesto
                    </Button>
                )}
            </div>

            {/* Banners */}
            {!isLoadingBudgets && !isLoadingExec && (
                <div className="space-y-3">
                    {!hasBudget && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                            <Info className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Sin presupuesto configurado</h4>
                                <p className="text-sm opacity-90">No se ha establecido un presupuesto para {months[month - 1]} de {year}. Crea uno para comenzar a medir la ejecución.</p>
                            </div>
                        </div>
                    )}

                    {hasBudget && (isExceeded || hasGlobalExceeded) && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Presupuesto superado</h4>
                                <p className="text-sm opacity-90">
                                    {hasGlobalExceeded
                                        ? "Los gastos totales ejecutados han superado el ingreso global proyectado para este mes."
                                        : "Una o más partidas presupuestarias han superado su límite asignado."}
                                </p>
                            </div>
                        </div>
                    )}

                    {hasBudget && isWarning && !hasGlobalExceeded && !isExceeded && (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Alerta de ejecución (80%)</h4>
                                <p className="text-sm opacity-90">Algunas partidas presupuestarias han superado el umbral del 80% de su límite.</p>
                            </div>
                        </div>
                    )}

                    {isPeriodClosed && (
                        <div className="flex items-center gap-3 p-4 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg">
                            <Lock className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Período Cerrado</h4>
                                <p className="text-sm opacity-90">Este mes contable se encuentra cerrado. No se admiten modificaciones presupuestarias ni se registrarán más gastos.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Componente Tabla de Ejecución (Se refresca automáticamente y muestra el loader individual) */}
            <BudgetExecutionTable year={year} month={month} />

            {/* Modal de Creación */}
            <BudgetDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                defaultYear={year}
                defaultMonth={month}
            />
        </div>
    );
}
