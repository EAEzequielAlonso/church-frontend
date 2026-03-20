import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Lock, Unlock, AlertCircle, CheckCircle2, AlertTriangle, FileSearch } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePeriods } from '../hooks/usePeriods';
import { usePendingTransactionsCount } from '../hooks/usePendingTransactionsCount';
import { PeriodStatus } from '../types/period.types';
import { formatCurrency } from '../utils/currency';
import { toast } from 'sonner';

interface PeriodClosingPanelProps {
    year: number;
    month: number;
    onViewReport?: (year: number, month: number) => void;
}

export function PeriodClosingPanel({ year, month, onViewReport }: PeriodClosingPanelProps) {
    const { churchId } = useAuth();
    const { period, isLoading, closePeriod, isClosing, reopenPeriod, isReopening } = usePeriods(churchId || '', year, month);
    const { count: pendingCount, isLoading: isPendingLoading } = usePendingTransactionsCount(churchId || '', year, month);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Validaremos pendiente cuando agreguemos el count 
    // const hasPendingTransactions = false; 

    const handleClose = async () => {
        if (!churchId) return;
        try {
            await closePeriod({ churchId, year, month });
            toast.success("Período cerrado exitosamente.");
            setIsConfirmOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Error al cerrar el período.");
        }
    };

    const handleReopen = async () => {
        if (!churchId) return;
        try {
            await reopenPeriod({ churchId, year, month });
            toast.success("Período reabierto existosamente.");
        } catch (error: any) {
            toast.error(error.message || "Error al reabrir el período. Asegúrese de tener permisos.");
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-slate-400">Panel de Cierre</CardTitle>
                </CardHeader>
                <CardContent className="h-32 flex items-center justify-center">
                    <span className="text-slate-400">Verificando estado...</span>
                </CardContent>
            </Card>
        );
    }

    const isClosed = period?.status === PeriodStatus.CLOSED;

    if (isClosed && period?.snapshot) {
        const snap = period.snapshot;
        return (
            <Card className="border-rose-100 bg-rose-50/10">
                <CardHeader className="pb-4 border-b">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-rose-700">
                            <Lock className="h-5 w-5" />
                            <CardTitle>Período Contable Cerrado</CardTitle>
                        </div>
                        {onViewReport && (
                            <Button variant="ghost" size="sm" onClick={() => onViewReport(year, month)} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                                <FileSearch className="h-4 w-4 mr-2" />
                                Ver Reporte de Cierre
                            </Button>
                        )}
                    </div>
                    <CardDescription>
                        Cerrado el {new Date(period.closedAt!).toLocaleDateString('es-AR', { dateStyle: 'long' })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded border shadow-sm">
                            <span className="text-xs text-slate-500 block mb-1">Ingresos Totales</span>
                            <span className="font-semibold text-emerald-600">{formatCurrency(snap.totalIncome)}</span>
                        </div>
                        <div className="bg-white p-3 rounded border shadow-sm">
                            <span className="text-xs text-slate-500 block mb-1">Egresos Totales</span>
                            <span className="font-semibold text-rose-600">{formatCurrency(snap.totalExpense)}</span>
                        </div>
                        <div className="bg-white p-3 rounded border shadow-sm">
                            <span className="text-xs text-slate-500 block mb-1">Transacciones</span>
                            <span className="font-semibold">{snap.transactionCount}</span>
                        </div>
                        <div className="bg-white p-3 rounded border shadow-sm">
                            <span className="text-xs text-slate-500 block mb-1">Presupuesto Asignado</span>
                            <span className="font-semibold text-slate-700">{formatCurrency(snap.budgetedIncome)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 border-t justify-end py-3">
                    <Button variant="outline" size="sm" onClick={handleReopen} disabled={isReopening} className="text-slate-600 hover:text-slate-900 shadow-none">
                        <Unlock className="h-4 w-4 mr-2" />
                        {isReopening ? 'Reabriendo...' : 'Reabrir Período'}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <>
            <Card className={pendingCount > 0 ? "border-amber-100 bg-amber-50/10" : "border-emerald-100 bg-emerald-50/10"}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <Unlock className="h-5 w-5" />
                            <CardTitle>Período Contable Abierto</CardTitle>
                        </div>
                        {onViewReport && (
                            <Button variant="outline" size="sm" onClick={() => onViewReport(year, month)} className="text-slate-600 border-slate-200">
                                <FileSearch className="h-4 w-4 mr-2" />
                                Ver detalle del mes
                            </Button>
                        )}
                    </div>
                    <CardDescription>
                        El período se encuentra activo y recibiendo transacciones financieras.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingCount > 0 ? (
                        <div className="bg-white border-amber-200 border rounded p-4 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm text-amber-800">Hay transacciones pendientes</h4>
                                <p className="text-sm text-amber-700 mt-1">
                                    Existen <strong>{pendingCount} movimient{pendingCount !== 1 ? 'os' : 'o'} en estado pendiente</strong> en este mes.
                                    Debes aprobarlos, completarlos o rechazarlos antes de cerrar el período para evitar incongruencias de balance.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border rounded p-4 flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-sm">Validaciones pre-cierre</h4>
                                <p className="text-sm text-slate-500 mt-1">
                                    No hay transacciones pendientes en este mes. Todo está listo para generar el snapshot oficial.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-slate-50/50 border-t justify-end py-3">
                    <Button
                        onClick={() => setIsConfirmOpen(true)}
                        disabled={isClosing || isPendingLoading || pendingCount > 0}
                        className={pendingCount > 0 ? "opacity-50 cursor-not-allowed bg-slate-400" : ""}
                    >
                        <Lock className="h-4 w-4 mr-2" />
                        Cerrar Período
                    </Button>
                </CardFooter>
            </Card>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro de cerrar el período?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción congelará el mes. Las transacciones y presupuestos de este período ya no podrán modificarse.
                            Se generará una foto inmutable (snapshot) del resumen financiero.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isClosing}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClose} disabled={isClosing} className="bg-rose-600 hover:bg-rose-700">
                            {isClosing ? 'Cerrando...' : 'Sí, cerrar período'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
