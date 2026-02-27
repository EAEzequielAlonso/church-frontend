import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateBudgetAllocationDto } from "../types/budget.types";
import { useBudgetAllocations } from "../hooks/useBudgetAllocations";
import { useMinistries } from "../../treasury/hooks/useMinistries";
import { useCategories } from "../../treasury/hooks/useCategories";

interface Props {
    periodId: string;
    disabled?: boolean;
    allocationToEdit?: {
        id: string;
        amount: number;
        ministry?: { id: string; name: string };
        category?: { id: string; name: string; type?: string };
    } | null;
    onClose?: () => void;
    isOpenControlled?: boolean;
}

export function BudgetAllocationDialog({ periodId, disabled, allocationToEdit, onClose, isOpenControlled }: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isEditMode = !!allocationToEdit;

    const open = isOpenControlled ?? internalOpen;
    const setOpen = (val: boolean) => {
        setInternalOpen(val);
        if (!val && onClose) onClose();
    };

    const { createAllocation, updateAllocation } = useBudgetAllocations(periodId);
    const { ministries } = useMinistries();
    const { categories } = useCategories();

    // Filter categories to only expense type? Budget applies to Expense usually.
    const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

    const [isLoading, setIsLoading] = useState(false);
    const [targetType, setTargetType] = useState<'ministry' | 'category' | 'both'>('ministry');

    const [form, setForm] = useState<Partial<CreateBudgetAllocationDto> & { categoryType?: 'income' | 'expense' }>({
        amount: allocationToEdit?.amount || 0,
        ministryId: allocationToEdit?.ministry?.id,
        categoryId: allocationToEdit?.category?.id,
        categoryType: allocationToEdit?.category?.type as any || 'expense' // Infer type if editing
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount || form.amount <= 0) return;

        setIsLoading(true);
        const dto: CreateBudgetAllocationDto = {
            budgetPeriodId: periodId,
            amount: Number(form.amount),
            ministryId: form.ministryId || undefined,
            categoryId: form.categoryId || undefined
        };

        let success = false;
        if (isEditMode && allocationToEdit) {
            success = await updateAllocation(allocationToEdit.id, dto);
        } else {
            success = await createAllocation(dto);
        }

        setIsLoading(false);
        if (success) {
            setOpen(false);
            if (!isEditMode) setForm({ amount: 0, ministryId: "", categoryId: "" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isEditMode && (
                <DialogTrigger asChild>
                    <Button disabled={disabled} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Asignar Presupuesto
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Asignación' : 'Nueva Asignación'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Budget Type Selector */}
                    <div>
                        <Label>Tipo de Presupuesto</Label>
                        <Select
                            value={form.categoryType || 'expense'}
                            disabled={isEditMode}
                            onValueChange={(v: 'income' | 'expense') => {
                                setForm(prev => ({ ...prev, categoryType: v, categoryId: "" }));
                                // If they switch type, we should probably reset target type to category or both, 
                                // because Ministry-only budget is ambiguous (is it income or expense?). 
                                // Actually, we can assign a "Ministry Budget" as Expense usually. 
                                // Let's assume Ministry Only = Expense. 
                                // If Income, force Category selection? 
                                // For simplicity, let user choose.
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Egresos (Gastos)</SelectItem>
                                <SelectItem value="income">Ingresos (Estimados)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Target Selection - DISABLED in Edit Mode */}
                    <div>
                        <Label>Nivel de Asignación</Label>
                        <Select
                            value={targetType}
                            disabled={isEditMode}
                            onValueChange={(v: any) => {
                                setTargetType(v);
                                setForm(prev => ({ ...prev, ministryId: "", categoryId: "" }));
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ministry">Ministerio Global (Solo Gastos)</SelectItem>
                                <SelectItem value="category">Por Categoría</SelectItem>
                                <SelectItem value="both">Ministerio + Categoría</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(targetType === 'ministry' || targetType === 'both' || (isEditMode && form.ministryId)) && (
                        <div>
                            <Label>Ministerio</Label>
                            <Select
                                value={form.ministryId}
                                disabled={isEditMode}
                                onValueChange={(v) => setForm({ ...form, ministryId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Ministerio" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ministries.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {(targetType === 'category' || targetType === 'both' || (isEditMode && form.categoryId)) && (
                        <div>
                            <Label>Categoría ({form.categoryType === 'income' ? 'Ingreso' : 'Egreso'})</Label>
                            <Select
                                value={form.categoryId}
                                disabled={isEditMode}
                                onValueChange={(v) => setForm({ ...form, categoryId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories
                                        ?.filter(c => c.type === (form.categoryType || 'expense'))
                                        .map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <Label>Monto</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
