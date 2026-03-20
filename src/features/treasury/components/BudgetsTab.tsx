import React, { useState, useMemo } from 'react';
import { useBudgetPeriods } from '../hooks/useBudgetPeriods';
import { useBudgetExecution } from '../hooks/useBudgetExecution';
import { BudgetPeriodDialog } from './BudgetPeriodDialog';
import { BudgetAllocationDialog } from './BudgetAllocationDialog';
import { BudgetExecutionTable } from './BudgetExecutionTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertCircle, Info, PlusCircle, FileText, Presentation } from 'lucide-react';
import { BudgetExecutionStatus, BudgetPeriodStatus } from '../types/budget.types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { FunctionalRole } from '@/types/auth-types';
import api from '@/lib/api';
import { toast } from 'sonner';

export function BudgetsTab() {
    const { user } = useAuth();
    const currentDate = new Date();
    const [year, setYear] = useState<number>(currentDate.getFullYear());
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
    const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false);
    const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const { periods, isLoading: isLoadingPeriods } = useBudgetPeriods(year);
    const { executionData } = useBudgetExecution(selectedPeriodId);

    const canExport = useMemo(() => {
        const userRoles = user?.roles || [];
        return userRoles.some(role => 
            [FunctionalRole.ADMIN_CHURCH, FunctionalRole.TREASURER, FunctionalRole.AUDITOR].includes(role as FunctionalRole)
        );
    }, [user]);

    const handleExportPpt = async () => {
        if (!selectedPeriodId) return;
        setIsExporting(true);
        try {
            const response = await api.get(`/budget/periods/${selectedPeriodId}/export-ppt`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Presupuesto-${activePeriod?.name || 'periodo'}.pptx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("PowerPoint generado exitosamente.");
        } catch (error) {
            console.error('Error exporting PPT', error);
            toast.error("Error al exportar el presupuesto a PowerPoint.");
        } finally {
            setIsExporting(false);
        }
    };

    // Auto-select first period
    const activePeriod = useMemo(() => {
        if (selectedPeriodId) {
            return periods.find(p => p.id === selectedPeriodId) || null;
        }
        if (periods.length > 0) {
            const first = periods[0];
            setSelectedPeriodId(first.id);
            return first;
        }
        return null;
    }, [periods, selectedPeriodId]);

    // Check execution alerts
    const { hasExceeded, hasWarning } = useMemo(() => {
        if (!executionData) return { hasExceeded: false, hasWarning: false };
        let exceeded = false;
        let warning = false;
        executionData.allocations.forEach(alloc => {
            if (alloc.status === BudgetExecutionStatus.EXCEEDED) exceeded = true;
            if (alloc.status === BudgetExecutionStatus.WARNING_80) warning = true;
        });
        return { hasExceeded: exceeded, hasWarning: warning };
    }, [executionData]);

    const getStatusBadge = (status: BudgetPeriodStatus) => {
        switch (status) {
            case BudgetPeriodStatus.ACTIVE:
                return <Badge className="bg-emerald-500 text-white text-xs">Activo</Badge>;
            case BudgetPeriodStatus.DRAFT:
                return <Badge variant="outline" className="text-xs">Borrador</Badge>;
            case BudgetPeriodStatus.CLOSED:
                return <Badge variant="secondary" className="text-xs">Cerrado</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <Input
                        type="number"
                        value={year}
                        onChange={(e) => {
                            setYear(parseInt(e.target.value) || currentDate.getFullYear());
                            setSelectedPeriodId('');
                        }}
                        className="w-[100px] bg-slate-50"
                    />

                    {periods.length > 0 && (
                        <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                            <SelectTrigger className="w-[280px] bg-slate-50">
                                <SelectValue placeholder="Seleccionar período" />
                            </SelectTrigger>
                            <SelectContent>
                                {periods.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                                            <span>{p.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {activePeriod && getStatusBadge(activePeriod.status)}
                </div>

                <div className="flex gap-2">
                    {canExport && selectedPeriodId && (
                        <Button 
                            onClick={handleExportPpt} 
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            disabled={isExporting}
                        >
                            <Presentation className="mr-2 h-4 w-4" />
                            {isExporting ? 'Exportando...' : 'Exportar PPT'}
                        </Button>
                    )}
                    {activePeriod && activePeriod.status === BudgetPeriodStatus.ACTIVE && (
                        <Button
                            onClick={() => setIsAllocationDialogOpen(true)}
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva Asignación
                        </Button>
                    )}
                    <Button onClick={() => setIsPeriodDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Período
                    </Button>
                </div>
            </div>

            {/* Banners */}
            {!isLoadingPeriods && (
                <div className="space-y-3">
                    {periods.length === 0 && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                            <Info className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Sin presupuestos configurados</h4>
                                <p className="text-sm opacity-90">No hay períodos presupuestarios para {year}. Crea uno para comenzar a planificar.</p>
                            </div>
                        </div>
                    )}

                    {hasExceeded && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Presupuesto superado</h4>
                                <p className="text-sm opacity-90">Una o más asignaciones presupuestarias han superado su límite.</p>
                            </div>
                        </div>
                    )}

                    {hasWarning && !hasExceeded && (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Alerta de ejecución (80%)</h4>
                                <p className="text-sm opacity-90">Algunas asignaciones presupuestarias han superado el umbral del 80%.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Execution Table */}
            {selectedPeriodId && <BudgetExecutionTable periodId={selectedPeriodId} />}

            {/* Dialogs */}
            <BudgetPeriodDialog
                open={isPeriodDialogOpen}
                onOpenChange={setIsPeriodDialogOpen}
                defaultYear={year}
            />
            {activePeriod && (
                <BudgetAllocationDialog
                    open={isAllocationDialogOpen}
                    onOpenChange={setIsAllocationDialogOpen}
                    periodId={activePeriod.id}
                />
            )}
        </div>
    );
}
