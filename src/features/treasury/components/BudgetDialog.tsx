import React, { useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBudgets } from '../hooks/useBudgets';
import { useMinistries } from '../hooks/useMinistries';
import { useCategories } from '../hooks/useCategories';
import { useIsPeriodClosed } from '../hooks/usePeriods';
import { BudgetLineType } from '../types/budget.types';
import { formatCurrency } from '../utils/currency';
import { toast } from 'sonner';

interface BudgetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultYear?: number;
    defaultMonth?: number;
}

const budgetLineSchema = z.object({
    type: z.nativeEnum(BudgetLineType),
    ministryId: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    budgetedAmount: z.number().positive("El monto debe ser mayor a cero")
}).refine(data => data.ministryId || data.categoryId, {
    message: "Debe proveer ministerio o categoría",
    path: ["categoryId"]
});

const budgetFormSchema = z.object({
    year: z.number().int().min(2000),
    month: z.number().int().min(1).max(12),
    projectedIncomeTotal: z.number().nonnegative("No puede ser negativo"),
    notes: z.string().optional(),
    reason: z.string().optional(),
    lines: z.array(budgetLineSchema)
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export function BudgetDialog({ open, onOpenChange, defaultYear = new Date().getFullYear(), defaultMonth = new Date().getMonth() + 1 }: BudgetDialogProps) {
    const { churchId } = useAuth();
    const { createBudget, isCreating } = useBudgets(churchId || '');
    const { ministries } = useMinistries();
    const { categories: incomeCats } = useCategories('income');
    const { categories: expenseCats } = useCategories('expense');

    const [generalError, setGeneralError] = useState<string | null>(null);

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetFormSchema),
        defaultValues: {
            year: defaultYear,
            month: defaultMonth,
            projectedIncomeTotal: 0,
            notes: '',
            reason: '',
            lines: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "lines"
    });

    const watchedLines = form.watch("lines");
    const projectedIncome = form.watch("projectedIncomeTotal") || 0;
    const watchYear = form.watch("year");
    const watchMonth = form.watch("month");
    const { isClosed: isPeriodClosed } = useIsPeriodClosed(churchId || '', watchYear, watchMonth);

    const totals = useMemo(() => {
        let income = 0;
        let expense = 0;
        watchedLines.forEach(line => {
            const amount = Number(line.budgetedAmount) || 0;
            if (line.type === BudgetLineType.INCOME) income += amount;
            if (line.type === BudgetLineType.EXPENSE) expense += amount;
        });
        return { income, expense };
    }, [watchedLines]);

    const handleAddLine = (type: BudgetLineType) => {
        append({ type, budgetedAmount: 0, ministryId: null, categoryId: null });
        setGeneralError(null);
    };

    const validateFinancials = (data: BudgetFormValues): boolean => {
        let expenseSum = 0;
        data.lines.forEach(l => {
            if (l.type === BudgetLineType.EXPENSE) {
                expenseSum += Number(l.budgetedAmount) || 0;
            }
        });

        if (expenseSum > data.projectedIncomeTotal) {
            setGeneralError(`El total de egresos planificados (${formatCurrency(expenseSum)}) supera el ingreso total proyectado (${formatCurrency(data.projectedIncomeTotal)}).`);
            return false;
        }

        const seen = new Set<string>();
        for (const line of data.lines) {
            const minKey = line.ministryId || '';
            const catKey = line.categoryId || '';
            const key = `${line.type}-${minKey}-${catKey}`;

            if (seen.has(key)) {
                setGeneralError('Existen líneas duplicadas (mismo tipo, ministerio y categoría). Consolide los montos en una sola línea.');
                return false;
            }
            seen.add(key);
        }

        setGeneralError(null);
        return true;
    };

    const onSubmit = async (data: BudgetFormValues) => {
        if (!churchId) return;

        if (!validateFinancials(data)) {
            return;
        }

        try {
            await createBudget({
                churchId,
                ...data
            });
            toast.success("Presupuesto guardado correctamente");
            form.reset();
            onOpenChange(false);
        } catch (error: any) {
            setGeneralError(error.message || "Error interno al guardar el presupuesto");
        }
    };

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                form.reset();
                setGeneralError(null);
            }
            onOpenChange(val);
        }} >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Nuevo Presupuesto Mensual</DialogTitle>
                </DialogHeader>

                {isPeriodClosed && (
                    <div className="mx-6 mt-4 p-3 bg-rose-50 text-rose-700 rounded-md border border-rose-200 flex items-start gap-2 text-sm font-medium">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                            El mes seleccionado se encuentra cerrado contablemente. No se permite crear ni editar presupuestos para este período.
                        </div>
                    </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">

                    {/* HEADER DEL PRESUPUESTO */}
                    <div className="flex gap-4 p-1 pb-4 border-b">
                        <div className="w-1/4">
                            <label className="text-sm font-medium mb-1.5 block">Mes</label>
                            <Controller
                                control={form.control}
                                name="month"
                                render={({ field }) => (
                                    <Select value={field.value.toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                                        <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
                                        <SelectContent>
                                            {months.map((m, i) => (
                                                <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.month && <span className="text-xs text-rose-500 mt-1">{form.formState.errors.month.message}</span>}
                        </div>

                        <div className="w-1/4">
                            <label className="text-sm font-medium mb-1.5 block">Año</label>
                            <Controller
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || new Date().getFullYear())} />
                                )}
                            />
                            {form.formState.errors.year && <span className="text-xs text-rose-500 mt-1">{form.formState.errors.year.message}</span>}
                        </div>

                        <div className="flex-1 space-y-3">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Ingreso Total Proyectado (Tope Global)</label>
                                <Controller
                                    control={form.control}
                                    name="projectedIncomeTotal"
                                    render={({ field }) => (
                                        <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                    )}
                                />
                                {form.formState.errors.projectedIncomeTotal && <span className="text-xs text-rose-500 mt-1">{form.formState.errors.projectedIncomeTotal.message}</span>}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Motivo / Razón para Auditoría (Opcional)</label>
                                <Controller
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Agrega contexto a esta versión..." />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LINE ITEMS */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-700">Líneas Presupuestarias</h3>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddLine(BudgetLineType.INCOME)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                    <PlusCircle className="h-4 w-4 mr-1" /> Ingreso
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddLine(BudgetLineType.EXPENSE)} className="text-rose-600 border-rose-200 hover:bg-rose-50">
                                    <PlusCircle className="h-4 w-4 mr-1" /> Egreso
                                </Button>
                            </div>
                        </div>

                        {fields.length === 0 && (
                            <div className="text-center p-8 bg-slate-50 border border-dashed rounded text-sm text-slate-500">
                                No hay líneas. Usa los botones para agregar ingresos específicos o gastos planificados.
                            </div>
                        )}

                        {fields.map((field, index) => {
                            const isIncome = watchedLines[index]?.type === BudgetLineType.INCOME;
                            const currentCats = isIncome ? incomeCats : expenseCats;

                            return (
                                <div key={field.id} className={`flex gap-3 items-start p-3 border rounded-lg ${isIncome ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>

                                    <div className="w-[80px] pt-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {isIncome ? 'INGRESO' : 'EGRESO'}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <Controller
                                            control={form.control}
                                            name={`lines.${index}.ministryId`}
                                            render={({ field: f }) => (
                                                <Select value={f.value || undefined} onValueChange={f.onChange}>
                                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Ministerio (Opcional)" /></SelectTrigger>
                                                    <SelectContent>
                                                        {ministries.map(m => (
                                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <Controller
                                            control={form.control}
                                            name={`lines.${index}.categoryId`}
                                            render={({ field: f }) => (
                                                <Select value={f.value || undefined} onValueChange={f.onChange}>
                                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Categoría" /></SelectTrigger>
                                                    <SelectContent>
                                                        {currentCats.map(c => (
                                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {form.formState.errors.lines?.[index]?.categoryId && (
                                            <span className="text-xs text-rose-500 mt-1 block">{form.formState.errors.lines[index]?.categoryId?.message}</span>
                                        )}
                                    </div>

                                    <div className="w-[140px]">
                                        <Controller
                                            control={form.control}
                                            name={`lines.${index}.budgetedAmount`}
                                            render={({ field: f }) => (
                                                <Input type="number" step="0.01" className="bg-white text-right" placeholder="0.00" {...f} onChange={e => f.onChange(parseFloat(e.target.value) || 0)} />
                                            )}
                                        />
                                        {form.formState.errors.lines?.[index]?.budgetedAmount && (
                                            <span className="text-xs text-rose-500 mt-1 block">{form.formState.errors.lines[index]?.budgetedAmount?.message}</span>
                                        )}
                                    </div>

                                    <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-rose-500" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    {/* FOOTER & TOTALS */}
                    <div className="pt-4 border-t mt-auto">
                        {generalError && (
                            <div className="mb-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 p-3 rounded border border-rose-100">
                                <AlertCircle className="h-4 w-4" />
                                <span>{generalError}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4 text-sm bg-slate-50 p-3 rounded">
                            <div className="flex gap-6">
                                <div>
                                    <span className="text-slate-500 block text-xs">Ingresos Planificados Específicos</span>
                                    <span className="font-semibold text-emerald-600">{formatCurrency(totals.income)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Egresos Planificados</span>
                                    <span className={`font-semibold ${totals.expense > projectedIncome ? 'text-rose-600' : 'text-slate-700'}`}>
                                        {formatCurrency(totals.expense)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-500 block text-xs">Tope Global (Ingreso Proyectado)</span>
                                <span className="font-bold text-lg">{formatCurrency(projectedIncome)}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isCreating || isPeriodClosed} className="bg-primary hover:bg-primary/90">
                                {isCreating ? 'Guardando...' : 'Guardar Presupuesto'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
