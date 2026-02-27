import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateBudgetPeriodDto, BudgetPeriodType } from "../types/budget.types";
import { useBudgetPeriods } from "../hooks/useBudgetPeriods";

interface Props {
    periodToEdit?: {
        id: string;
        name: string;
        type: BudgetPeriodType;
        startDate: string;
        endDate: string;
        currency: string;
    } | null;
    onClose?: () => void;
    isOpenControlled?: boolean;
}

export function BudgetPeriodDialog({ periodToEdit, onClose, isOpenControlled }: Props = {}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { createPeriod, updatePeriod } = useBudgetPeriods();
    const [isLoading, setIsLoading] = useState(false);

    const isControlled = typeof isOpenControlled !== 'undefined';
    const open = isControlled ? isOpenControlled : internalOpen;
    const setOpen = (val: boolean) => {
        if (isControlled) {
            if (!val && onClose) onClose();
        } else {
            setInternalOpen(val);
        }
    };

    const isEditMode = !!periodToEdit;

    const [form, setForm] = useState<CreateBudgetPeriodDto>({
        name: "",
        type: BudgetPeriodType.MONTHLY,
        startDate: "",
        endDate: "",
        currency: "ARS"
    });

    useEffect(() => {
        if (periodToEdit) {
            setForm({
                name: periodToEdit.name,
                type: periodToEdit.type,
                startDate: periodToEdit.startDate.split('T')[0],
                endDate: periodToEdit.endDate.split('T')[0],
                currency: periodToEdit.currency
            });
        } else {
            setForm({
                name: "",
                type: BudgetPeriodType.MONTHLY,
                startDate: "",
                endDate: "",
                currency: "ARS"
            });
        }
    }, [periodToEdit, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let success = false;
        if (isEditMode && periodToEdit) {
            success = await updatePeriod(periodToEdit.id, form);
        } else {
            success = await createPeriod(form);
        }

        setIsLoading(false);
        if (success) {
            setOpen(false);
            if (!isEditMode) {
                setForm({
                    name: "",
                    type: BudgetPeriodType.MONTHLY,
                    startDate: "",
                    endDate: "",
                    currency: "ARS"
                });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button>Nuevo Periodo</Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Periodo' : 'Crear Periodo Presupuestario'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Nombre</Label>
                        <Input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Ej: Presupuesto Enero 2024"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Tipo</Label>
                            <Select
                                value={form.type}
                                onValueChange={(v) => setForm({ ...form, type: v as BudgetPeriodType })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={BudgetPeriodType.MONTHLY}>Mensual</SelectItem>
                                    <SelectItem value={BudgetPeriodType.YEARLY}>Anual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Moneda</Label>
                            <Select
                                value={form.currency}
                                onValueChange={(v) => setForm({ ...form, currency: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ARS">ARS (Pesos)</SelectItem>
                                    <SelectItem value="USD">USD (Dólares)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Fecha Inicio</Label>
                            <Input
                                type="date"
                                value={form.startDate}
                                onChange={e => setForm({ ...form, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Fecha Fin</Label>
                            <Input
                                type="date"
                                value={form.endDate}
                                onChange={e => setForm({ ...form, endDate: e.target.value })}
                                required
                            />
                        </div>
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
