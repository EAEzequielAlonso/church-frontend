import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { useBudgetAllocations } from '../hooks/useBudgetAllocations';
import { useMinistries } from '../hooks/useMinistries';
import { useCategories } from '../hooks/useCategories';
import type { TransactionType } from '../types/budget.types';
import { toast } from 'sonner';

interface BudgetAllocationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    periodId: string;
}

const allocationFormSchema = z.object({
    type: z.enum(['income', 'expense']),
    ministryId: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    amount: z.number().positive('El monto debe ser mayor a cero'),
    notes: z.string().optional(),
}).refine(data => data.ministryId || data.categoryId, {
    message: 'Debe proveer ministerio o categoría',
    path: ['categoryId'],
});

type AllocationFormValues = z.infer<typeof allocationFormSchema>;

export function BudgetAllocationDialog({ open, onOpenChange, periodId }: BudgetAllocationDialogProps) {
    const { createAllocation, isCreating } = useBudgetAllocations(periodId);
    const { ministries } = useMinistries();
    const { categories: incomeCats } = useCategories('income');
    const { categories: expenseCats } = useCategories('expense');
    const [generalError, setGeneralError] = useState<string | null>(null);

    const form = useForm<AllocationFormValues>({
        resolver: zodResolver(allocationFormSchema),
        defaultValues: {
            type: 'expense',
            ministryId: null,
            categoryId: null,
            amount: 0,
            notes: '',
        },
    });

    const watchType = form.watch('type');
    const currentCats = watchType === 'income' ? incomeCats : expenseCats;

    const onSubmit = async (data: AllocationFormValues) => {
        setGeneralError(null);
        try {
            await createAllocation({
                budgetPeriodId: periodId,
                type: data.type as TransactionType,
                ministryId: data.ministryId || null,
                categoryId: data.categoryId || null,
                amount: data.amount,
                notes: data.notes,
            });
            toast.success('Asignación presupuestaria creada');
            form.reset();
            onOpenChange(false);
        } catch (error: any) {
            setGeneralError(error.message || 'Error al crear la asignación');
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                form.reset();
                setGeneralError(null);
            }
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nueva Asignación Presupuestaria</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Type */}
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Tipo</label>
                        <Controller
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={(v) => {
                                    field.onChange(v);
                                    form.setValue('categoryId', null);
                                }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">
                                            <span className="text-emerald-600 font-medium">Ingreso</span>
                                        </SelectItem>
                                        <SelectItem value="expense">
                                            <span className="text-rose-600 font-medium">Egreso</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Ministry */}
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Ministerio (opcional)</label>
                        <Controller
                            control={form.control}
                            name="ministryId"
                            render={({ field }) => (
                                <Select value={field.value || undefined} onValueChange={field.onChange}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Sin ministerio" /></SelectTrigger>
                                    <SelectContent>
                                        {ministries.map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Categoría</label>
                        <Controller
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <Select value={field.value || undefined} onValueChange={field.onChange}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                                    <SelectContent>
                                        {currentCats.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.categoryId && (
                            <span className="text-xs text-rose-500 mt-1 block">{form.formState.errors.categoryId.message}</span>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Monto Presupuestado</label>
                        <Controller
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="bg-white text-right"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                            )}
                        />
                        {form.formState.errors.amount && (
                            <span className="text-xs text-rose-500 mt-1 block">{form.formState.errors.amount.message}</span>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Notas (opcional)</label>
                        <Controller
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <Textarea {...field} placeholder="Notas sobre esta asignación..." rows={2} />
                            )}
                        />
                    </div>

                    {/* Error */}
                    {generalError && (
                        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 p-3 rounded border border-rose-100">
                            <AlertCircle className="h-4 w-4" />
                            <span>{generalError}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
                            {isCreating ? 'Guardando...' : 'Agregar Asignación'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
