
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useMinistries } from '../hooks/useMinistries';
import { TreasuryAccountModel, AccountType } from '../types/treasury.types';
import { CreateBudgetDto } from '../types/budget.types';

import { useCategories } from '../hooks/useCategories';
import { toast } from 'sonner';
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

interface BudgetsTabProps {
    accounts: TreasuryAccountModel[];
}

export function BudgetsTab({ accounts }: BudgetsTabProps) {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const { budgets, create, remove, isLoading } = useBudgets(year);
    const { ministries } = useMinistries();
    const { categories: expenseCats } = useCategories('expense');
    const { categories: incomeCats } = useCategories('income');
    const allCategories = [...expenseCats, ...incomeCats];

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [selectedMinistryId, setSelectedMinistryId] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedMinistryId && !selectedCategoryId) {
            toast.error("Debe seleccionar al menos un Ministerio o una Categoría.");
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error("El monto debe ser mayor a 0.");
            return;
        }

        const dto: any = {
            amountLimit: parsedAmount,
            period,
            year,
            ministryId: selectedMinistryId.trim() || undefined,
            categoryId: selectedCategoryId.trim() || undefined
        };

        try {
            await create(dto);
            toast.success("Presupuesto creado correctamente");
            setIsDialogOpen(false);
            setAmount('');
            setSelectedMinistryId('');
            setSelectedCategoryId('');
        } catch (err) {
            console.error("Failed to create budget", err);
            toast.error("Error al crear el presupuesto");
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await remove(id);
            toast.success("Presupuesto eliminado");
        } catch (error) {
            toast.error("Error al eliminar presupuesto");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-800">Presupuestos {year}</h2>
                    <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2027">2027</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Definir Presupuesto
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nuevo Presupuesto {year}</DialogTitle>
                            <DialogDescription>
                                Un presupuesto puede aplicarse a un Ministerio, a una Categoría, o a ambos.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">

                            {/* Independent Selects */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ministerio (Opcional)</Label>
                                    <Select value={selectedMinistryId} onValueChange={setSelectedMinistryId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">-- Ninguno --</SelectItem>
                                            {ministries.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Categoría (Opcional)</Label>
                                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">-- Ninguna --</SelectItem>
                                            {allCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.type === 'income' ? 'Ingreso' : 'Egreso'})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Límite</Label>
                                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" min="0.01" step="0.01" />
                            </div>

                            <div className="space-y-2">
                                <Label>Periodo</Label>
                                <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Mensual</SelectItem>
                                        <SelectItem value="yearly">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full">Guardar</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {budgets.map(budget => (
                    <Card key={budget.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {budget.ministry && budget.category ? (
                                    <span className="text-violet-600">
                                        {budget.ministry.name} - {budget.category.name}
                                    </span>
                                ) : budget.ministry ? (
                                    `Ministerio: ${budget.ministry.name}`
                                ) : budget.category ? (
                                    `Categoría: ${budget.category.name}`
                                ) : (
                                    <span className="text-red-500">Sin asignar</span>
                                )}
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(budget.amountLimit)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {budget.period === 'monthly' ? 'Límite Mensual' : 'Límite Anual'}
                            </p>
                            <div className="mt-4 flex justify-end">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará el presupuesto permanentemente.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRemove(budget.id)} className="bg-rose-600 hover:bg-rose-700">
                                                Eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {budgets.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 border border-dashed rounded-lg">
                        No hay presupuestos definidos para {year}.
                    </div>
                )}
            </div>
        </div>
    );
}
