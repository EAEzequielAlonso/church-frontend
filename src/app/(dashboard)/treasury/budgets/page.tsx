'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

export default function BudgetsPage() {
    const { churchId } = useAuth();
    const router = useRouter();
    const [budgets, setBudgets] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [ministries, setMinistries] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchData = async () => {
        if (!churchId) return;
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [budgetsRes, txRes, minRes, accRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/budgets?year=${year}`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/transactions`, { headers }), // We need all txs to calc executed. Optimizable? Yes. MVP? Fine.
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/ministries`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/accounts`, { headers })
            ]);

            if (budgetsRes.ok) setBudgets(await budgetsRes.json());
            if (txRes.ok) setTransactions(await txRes.json());
            if (minRes.ok) setMinistries(await minRes.json());
            if (accRes.ok) {
                const accounts = await accRes.json();
                setCategories(accounts.filter((a: any) => a.type === 'expense'));
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [churchId, year]);

    // Calculate Executed Spend per Budget
    const getExecutedAmount = (ministryId: string, categoryId: string) => {
        return transactions
            .filter((tx: any) =>
                tx.ministry?.id === ministryId &&
                tx.destinationAccount?.id === categoryId &&
                new Date(tx.date).getFullYear() === year
            )
            .reduce((acc, tx) => acc + Number(tx.amount), 0);
    };

    const totalProjected = budgets.reduce((acc, b) => acc + Number(b.amountLimit), 0);
    const totalExecuted = budgets.reduce((acc, b) => acc + getExecutedAmount(b.ministry?.id, b.category?.id), 0);
    const totalProgress = totalProjected > 0 ? (totalExecuted / totalProjected) * 100 : 0;

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/treasury')} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Presupuestos {year}</h1>
                        <p className="text-sm font-medium text-slate-500">Planificación financiera y control de gastos.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Select value={year.toString()} onValueChange={(val) => setYear(Number(val))}>
                        <SelectTrigger className="w-[100px] font-bold bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                    </Select>
                    <NewBudgetDialog
                        ministries={ministries}
                        categories={categories}
                        year={year}
                        onSuccess={fetchData}
                    />
                </div>
            </div>

            {/* General Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none shadow-xl shadow-slate-200/50 bg-white">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-700">Ejecución Global</CardTitle>
                        <CardDescription>Gastos reales vs. Presupuestados para {year}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 rounded-full ${totalProgress > 100 ? 'bg-rose-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min(totalProgress, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Ejecutado</p>
                                <p className={`font-bold text-xl ${totalExecuted > totalProjected ? 'text-rose-600' : 'text-slate-800'}`}>
                                    ${totalExecuted.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase">Proyectado</p>
                                <p className="font-bold text-xl text-slate-800">${totalProjected.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                            <Target className="w-5 h-5 text-emerald-400" />
                            Estado General
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold tracking-tight">
                            {totalProgress.toFixed(1)}%
                        </div>
                        <p className="text-sm font-medium text-slate-400 mt-1">del presupuesto consumido</p>

                        {totalProgress > 100 && (
                            <div className="mt-4 flex items-center gap-2 text-rose-300 bg-rose-500/10 p-2 rounded-lg">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-xs font-bold">Excedido en un {(totalProgress - 100).toFixed(1)}%</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Detalle por Ministerio</h2>

                {budgets.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                        <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium text-sm">No hay presupuestos definidos para este año.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {budgets.map((budget) => {
                            const executed = getExecutedAmount(budget.ministry?.id, budget.category?.id);
                            const limit = Number(budget.amountLimit);
                            const progress = (executed / limit) * 100;
                            const isOver = executed > limit;

                            return (
                                <Card key={budget.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                                    <CardHeader className="pb-3 border-b border-slate-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-sm font-bold text-slate-800">{budget.ministry?.name}</CardTitle>
                                                <CardDescription className="text-xs font-medium text-slate-500">{budget.category?.name}</CardDescription>
                                            </div>
                                            {isOver && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className={`text-2xl font-bold tracking-tight ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                                                ${executed.toLocaleString()}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400 mb-1">
                                                / ${limit.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function NewBudgetDialog({ ministries, categories, year, onSuccess }: any) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        ministryId: '',
        categoryId: '',
        amountLimit: '',
        period: 'yearly',
        year: year
    });

    const handleSave = async () => {
        if ((!form.ministryId && !form.categoryId) || !form.amountLimit) {
            toast.error('Debes seleccionar al menos un Ministerio o una Categoría, y definir un monto.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/budgets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...form,
                    ministryId: form.ministryId || null,
                    categoryId: form.categoryId || null,
                    year,
                    amountLimit: Number(form.amountLimit)
                })
            });

            if (res.ok) {
                toast.success('Presupuesto creado');
                onSuccess();
                setOpen(false);
                setForm({ ...form, amountLimit: '' });
            } else {
                toast.error('Error al crear presupuesto');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Presupuesto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-none shadow-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800">Definir Presupuesto</DialogTitle>
                    <DialogDescription className="text-xs font-medium text-slate-400">
                        Asigna un límite de gastos para un ministerio y/o categoría en {year}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Ministerio (Opcional)</Label>
                        <Select onValueChange={(val) => setForm({ ...form, ministryId: val === 'none' ? '' : val })}>
                            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-100">
                                <SelectValue placeholder="Seleccionar Ministerio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Ninguno (General)</SelectItem>
                                {ministries.map((m: any) => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Categoría de Gasto (Opcional)</Label>
                        <Select onValueChange={(val) => setForm({ ...form, categoryId: val === 'none' ? '' : val })}>
                            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-100">
                                <SelectValue placeholder="Seleccionar Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Ninguna (General)</SelectItem>
                                {categories.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Monto Límite (Anual)</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={form.amountLimit}
                            onChange={(e) => setForm({ ...form, amountLimit: e.target.value })}
                            className="h-11 text-lg font-bold bg-slate-50/50 border-slate-100"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading} className="w-full bg-primary font-bold h-11 rounded-xl">
                        {loading ? 'Guardando...' : 'Crear Presupuesto'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
