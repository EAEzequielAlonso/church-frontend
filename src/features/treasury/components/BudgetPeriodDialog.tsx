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
import { useBudgetPeriods } from '../hooks/useBudgetPeriods';
import { BudgetPeriodType } from '../types/budget.types';
import { toast } from 'sonner';

interface BudgetPeriodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultYear?: number;
}

const periodFormSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    type: z.nativeEnum(BudgetPeriodType),
    startDate: z.string().min(1, 'Fecha de inicio requerida'),
    endDate: z.string().min(1, 'Fecha de fin requerida'),
    description: z.string().optional(),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: 'La fecha de fin debe ser posterior a la de inicio',
    path: ['endDate'],
});

type PeriodFormValues = z.infer<typeof periodFormSchema>;

const periodTypeLabels: Record<BudgetPeriodType, string> = {
    [BudgetPeriodType.MONTHLY]: 'Mensual',
    [BudgetPeriodType.QUARTERLY]: 'Trimestral',
    [BudgetPeriodType.YEARLY]: 'Anual',
    [BudgetPeriodType.CUSTOM]: 'Personalizado',
    [BudgetPeriodType.PROJECT]: 'Proyecto',
};

function getDefaultDates(type: BudgetPeriodType, year: number) {
    const now = new Date();
    const month = now.getMonth();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    switch (type) {
        case BudgetPeriodType.MONTHLY: {
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0);
            return {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
                name: `Presupuesto ${monthNames[month]} ${year}`
            };
        }
        case BudgetPeriodType.QUARTERLY: {
            const q = Math.floor(month / 3);
            const start = new Date(year, q * 3, 1);
            const end = new Date(year, q * 3 + 3, 0);
            return {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
                name: `Presupuesto Q${q + 1} ${year}`
            };
        }
        case BudgetPeriodType.YEARLY:
            return {
                startDate: `${year}-01-01`,
                endDate: `${year}-12-31`,
                name: `Presupuesto Anual ${year}`
            };
        case BudgetPeriodType.PROJECT:
            return { startDate: '', endDate: '', name: 'Proyecto: ' };
        default:
            return { startDate: '', endDate: '', name: `Presupuesto ${year}` };
    }
}

export function BudgetPeriodDialog({ open, onOpenChange, defaultYear = new Date().getFullYear() }: BudgetPeriodDialogProps) {
    const { createPeriod, isCreating } = useBudgetPeriods(defaultYear);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const form = useForm<PeriodFormValues>({
        resolver: zodResolver(periodFormSchema),
        defaultValues: {
            name: `Presupuesto Anual ${defaultYear}`,
            type: BudgetPeriodType.YEARLY,
            startDate: `${defaultYear}-01-01`,
            endDate: `${defaultYear}-12-31`,
            description: '',
        },
    });

    const watchType = form.watch('type');

    const handleTypeChange = (type: BudgetPeriodType) => {
        form.setValue('type', type);
        const dates = getDefaultDates(type, defaultYear);
        if (dates.startDate) form.setValue('startDate', dates.startDate);
        if (dates.endDate) form.setValue('endDate', dates.endDate);
        if (dates.name) form.setValue('name', dates.name);
    };

    const onSubmit = async (data: PeriodFormValues) => {
        setGeneralError(null);
        try {
            await createPeriod(data);
            toast.success('Período presupuestario creado correctamente');
            form.reset();
            onOpenChange(false);
        } catch (error: any) {
            setGeneralError(error.message || 'Error al crear el período');
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
                    <DialogTitle>Nuevo Período Presupuestario</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Nombre</label>
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <Input {...field} placeholder="Ej: Presupuesto Anual 2026" />
                            )}
                        />
                        {form.formState.errors.name && <span className="text-xs text-rose-500 mt-1">{form.formState.errors.name.message}</span>}
                    </div>

                    {/* Type */}
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Tipo</label>
                        <Select value={watchType} onValueChange={(v) => handleTypeChange(v as BudgetPeriodType)}>
                            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(periodTypeLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Fecha Inicio</label>
                            <Controller
                                control={form.control}
                                name="startDate"
                                render={({ field }) => <Input type="date" {...field} />}
                            />
                            {form.formState.errors.startDate && <span className="text-xs text-rose-500 mt-1">{form.formState.errors.startDate.message}</span>}
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Fecha Fin</label>
                            <Controller
                                control={form.control}
                                name="endDate"
                                render={({ field }) => <Input type="date" {...field} />}
                            />
                            {form.formState.errors.endDate && <span className="text-xs text-rose-500 mt-1">{form.formState.errors.endDate.message}</span>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Descripción (opcional)</label>
                        <Controller
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <Textarea {...field} placeholder="Notas sobre este período..." rows={2} />
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
                            {isCreating ? 'Creando...' : 'Crear Período'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
