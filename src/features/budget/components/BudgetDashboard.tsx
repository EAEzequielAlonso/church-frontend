import { useState } from "react";
import { useBudgetPeriods } from "../hooks/useBudgetPeriods";
import { useBudgetExecution } from "../hooks/useBudgetExecution";
import { BudgetSummaryCards } from "./BudgetSummaryCards";
import { BudgetExecutionTable } from "./BudgetExecutionTable";
import { BudgetPeriodDialog } from "./BudgetPeriodDialog";
import { BudgetAllocationDialog } from "./BudgetAllocationDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetPdfService } from "../services/budget-pdf.service";
import { Download, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function BudgetPeriodDialogWrapper({ period }: { period: any }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar Periodo
            </Button>
            <BudgetPeriodDialog
                periodToEdit={period}
                isOpenControlled={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
}

export function BudgetDashboard() {
    // 1. Fetch Periods
    const { periods, isLoading: periodsLoading, deletePeriod } = useBudgetPeriods();

    // 2. State for Selected Period
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    // Set default period once loaded
    if (!selectedPeriodId && periods.length > 0) {
        setSelectedPeriodId(periods[0].id);
    }

    // 3. Fetch Execution Data for Selected Period
    const { executionData, isLoading: executionLoading, error } = useBudgetExecution(selectedPeriodId);

    const period = periods.find(p => p.id === selectedPeriodId);

    const handleExportPdf = () => {
        if (!executionData || !period) return;
        try {
            BudgetPdfService.generateReport(executionData, period.name);
            toast.success("Reporte descargado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al generar el PDF");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold tracking-tight">Presupuestos</h2>
                    <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar Periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            {periods.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportPdf} disabled={!selectedPeriodId}>
                        <Download className="mr-2 h-4 w-4" /> Exportar PDF
                    </Button>
                    <BudgetPeriodDialog />
                </div>
            </div>

            {/* Coherence & Summary Cards */}
            {executionData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Calculation Logic */}
                    {(() => {
                        const incomeAllocations = executionData.allocations.filter(a => a.category?.type === 'income');
                        const expenseAllocations = executionData.allocations.filter(a => a.category?.type === 'expense' || !a.category); // Default to expense if mixed/unknown

                        const totalEstIncome = incomeAllocations.reduce((sum, a) => sum + a.budgetAmount, 0);
                        const totalLimitExpense = expenseAllocations.reduce((sum, a) => sum + a.budgetAmount, 0);
                        const projBalance = totalEstIncome - totalLimitExpense;
                        const isProjDeficit = projBalance < 0;

                        const totalRealIncome = incomeAllocations.reduce((sum, a) => sum + a.spentAmount, 0);
                        const totalRealExpense = expenseAllocations.reduce((sum, a) => sum + a.spentAmount, 0);
                        const realBalance = totalRealIncome - totalRealExpense;
                        const isRealDeficit = realBalance < 0;

                        return (
                            <>
                                {/* CARD 1: PLANNING */}
                                <Card className="border-none shadow-xl shadow-slate-200/50 bg-white relative overflow-hidden">
                                    {/* ... (Same design as approved plan) ... */}
                                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                            Planificación
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Ingresos Est.</p>
                                                <p className="text-lg font-bold text-emerald-800">${totalEstIncome.toLocaleString()}</p>
                                            </div>
                                            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                                                <p className="text-xs font-bold text-rose-600 uppercase mb-1">Gastos Límite</p>
                                                <p className="text-lg font-bold text-rose-800">${totalLimitExpense.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-xl border-l-4 ${isProjDeficit ? 'bg-amber-50 border-amber-500' : 'bg-blue-50 border-blue-500'}`}>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-xs font-bold uppercase tracking-wider ${isProjDeficit ? 'text-amber-700' : 'text-blue-700'}`}>
                                                    Resultado Proyectado
                                                </p>
                                                <span className={`text-2xl font-black ${isProjDeficit ? 'text-amber-600' : 'text-blue-600'}`}>
                                                    ${projBalance.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* CARD 2: EXECUTION */}
                                <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                            Ejecución Real
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Ingresos</p>
                                                <p className="text-lg font-bold text-emerald-200">${totalRealIncome.toLocaleString()}</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-xs font-bold text-rose-400 uppercase mb-1">Gastos</p>
                                                <p className="text-lg font-bold text-rose-200">${totalRealExpense.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-xl border-l-4 bg-white/5 ${isRealDeficit ? 'border-rose-500' : 'border-emerald-500'}`}>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                                    Saldo Real
                                                </p>
                                                <span className={`text-2xl font-black ${isRealDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                    ${realBalance.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* Main Content */}
            <Tabs defaultValue="execution" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="execution">Ejecución</TabsTrigger>
                        <TabsTrigger value="settings" disabled={!selectedPeriodId}>Configuración</TabsTrigger>
                    </TabsList>
                    {selectedPeriodId && (
                        <BudgetAllocationDialog periodId={selectedPeriodId} />
                    )}
                </div>

                <TabsContent value="execution" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalle de Ejecución</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {executionData ? (
                                <BudgetExecutionTable
                                    periodId={selectedPeriodId}
                                    allocations={executionData.allocations}
                                    isLoading={executionLoading}
                                />
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    {selectedPeriodId ? "Cargando datos..." : "Seleccione un periodo para ver la ejecución."}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración del Periodo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {period ? (
                                <>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Nombre</Label>
                                            <Input value={period.name} disabled className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Fechas</Label>
                                            <Input value={`${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`} disabled className="col-span-3" />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 justify-end">
                                        <div className="relative">
                                            {/* Hack: The dialog has its own trigger, but we want a different look here. 
                                                Ideally we refactor Dialog to be fully controlled and separate Trigger. 
                                                For now we can just use the dialog as is, or pass a custom trigger if we updated it.
                                                Looking at BudgetPeriodDialog, it renders a "Nuevo Periodo" button.
                                                We need to modify it to accept a custom trigger OR we wrap it. 
                                                
                                                Let's update BudgetPeriodDialog to allow custom trigger first? 
                                                Or just pass isOpenControlled to it.
                                            */}
                                            <BudgetPeriodDialogWrapper period={period} />
                                        </div>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Periodo
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción eliminará el periodo presupuestario "{period.name}" y todas sus asignaciones. Esta acción no se puede deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={async () => {
                                                            const success = await deletePeriod(period.id);
                                                            if (success) setSelectedPeriodId("");
                                                        }}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    Seleccione un periodo para ver su configuración.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>


        </div>
    );
}
