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

            const [budgetsRes, txRes, minRes, catRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/budgets?year=${year}`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/transactions`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/ministries`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/categories`, { headers })
            ]);

            if (budgetsRes.ok) setBudgets(await budgetsRes.json());
            if (txRes.ok) setTransactions(await txRes.json());
            if (minRes.ok) setMinistries(await minRes.json());
            if (catRes.ok) setCategories(await catRes.json());

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [churchId, year]);

    // Update Executed Amount Logic: Match by Category ID
    const getExecutedAmount = (ministryId: string | null, categoryId: string | undefined) => {
        return transactions
            .filter((tx: any) => {
                const isSameYear = new Date(tx.date).getFullYear() === year;
                const matchesCategory = categoryId ? tx.category?.id === categoryId : true;
                const matchesMinistry = ministryId ? tx.ministry?.id === ministryId : true;
                return isSameYear && matchesCategory && matchesMinistry;
            })
            .reduce((acc, tx) => acc + Number(tx.amount), 0);
    };

    // Filter Budgets by Type
    const incomeBudgets = budgets.filter(b => b.category?.type === 'income');
    const expenseBudgets = budgets.filter(b => b.category?.type === 'expense');

    // --- COHERENCE CALCULATIONS ---

    // 1. Planning (Estimated)
    const totalEstimatedIncome = incomeBudgets.reduce((acc, b) => acc + Number(b.amountLimit), 0);
    const totalBudgetedExpense = expenseBudgets.reduce((acc, b) => acc + Number(b.amountLimit), 0);
    const projectedBalance = totalEstimatedIncome - totalBudgetedExpense;
    const isProjectedDeficit = projectedBalance < 0;

    // 2. Real (Executed)
    // For Real Income, we sum ALL executed amounts of INCOME budgets
    // Note: This only counts income associated with a Budget. Simple for Coherence view. 
    // If user wants ALL income even unbudgeted, we'd filter transactions directly. 
    // Requirement says "evaluar la coherencia", implying comparing Plans. 
    // But "Real Execution" usually means "Real Reality". 
    // Let's use Real Totals from Budgets for now to align with the view context.
    const totalRealIncome = incomeBudgets.reduce((acc, b) => acc + getExecutedAmount(b.ministry?.id, b.category?.id), 0);
    const totalRealExpense = expenseBudgets.reduce((acc, b) => acc + getExecutedAmount(b.ministry?.id, b.category?.id), 0);
    const realBalance = totalRealIncome - totalRealExpense;
    const isRealDeficit = realBalance < 0;

    return (
        <div className="space-y-8 max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/treasury')} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Presupuestos {year}</h1>
                        <p className="text-sm font-medium text-slate-500">Planificación, coherencia y control.</p>
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

            {/* --- COHERENCE OVERVIEW --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CARD 1: PLANNING (The Promise) */}
                <Card className="border-none shadow-xl shadow-slate-200/50 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Target className="w-24 h-24 text-slate-900" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-500" />
                            Planificación Financiera
                        </CardTitle>
                        <CardDescription>Coherencia entre Ingresos Estimados y Gastos Presupuestados.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Ingresos Estimados</p>
                                <p className="text-lg font-bold text-emerald-800">${totalEstimatedIncome.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                                <p className="text-xs font-bold text-rose-600 uppercase mb-1">Gastos Límite</p>
                                <p className="text-lg font-bold text-rose-800">${totalBudgetedExpense.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl border-l-4 ${isProjectedDeficit ? 'bg-amber-50 border-amber-500' : 'bg-blue-50 border-blue-500'}`}>
                            <div className="flex justify-between items-center">
                                <p className={`text-xs font-bold uppercase tracking-wider ${isProjectedDeficit ? 'text-amber-700' : 'text-blue-700'}`}>
                                    Resultado Proyectado
                                </p>
                                <span className={`text-2xl font-black ${isProjectedDeficit ? 'text-amber-600' : 'text-blue-600'}`}>
                                    ${projectedBalance.toLocaleString()}
                                </span>
                            </div>
                            {isProjectedDeficit && (
                                <p className="text-xs font-medium text-amber-600 mt-1">
                                    ¡Atención! Has presupuestado gastar más de lo que esperas recibir.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* CARD 2: EXECUTION (The Reality) */}
                <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <TrendingUp className="w-24 h-24 text-white" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Ejecución Real
                        </CardTitle>
                        <CardDescription className="text-slate-400">Flujo de caja real basado en estos presupuestos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Ingresos Reales</p>
                                <p className="text-lg font-bold text-emerald-200">${totalRealIncome.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-xs font-bold text-rose-400 uppercase mb-1">Gastos Reales</p>
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
            </div>

            {/* --- SECTION 1: ESTIMATED INCOME --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                    <h2 className="text-lg font-bold text-emerald-900">Ingresos Estimados</h2>
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Planificación
                    </span>
                </div>

                {incomeBudgets.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-emerald-100/50 bg-emerald-50/30 rounded-3xl">
                        <p className="text-emerald-400 font-medium text-sm">No hay estimaciones de ingreso definidas.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {incomeBudgets.map((budget) => {
                            const executed = getExecutedAmount(budget.ministry?.id, budget.category?.id);
                            const limit = Number(budget.amountLimit);
                            const progress = limit > 0 ? (executed / limit) * 100 : 0;
                            // For INCOME: Green if Executed >= Limit is GOOD (surpassed goal)
                            const isGoalMet = executed >= limit;

                            return (
                                <Card key={budget.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group bg-white">
                                    <CardHeader className="pb-3 border-b border-slate-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-sm font-bold text-slate-800">{budget.category?.name || 'General'}</CardTitle>
                                                {budget.ministry && <CardDescription className="text-xs font-medium text-slate-500">{budget.ministry.name}</CardDescription>}
                                            </div>
                                            {isGoalMet && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className={`text-2xl font-bold tracking-tight ${isGoalMet ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                ${executed.toLocaleString()}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400 mb-1">
                                                / ${limit.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${isGoalMet ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-right font-bold text-slate-400">
                                            {progress.toFixed(1)}% Recaudado
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- SECTION 2: BUDGETED EXPENSES --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-rose-500 pl-3">
                    <h2 className="text-lg font-bold text-rose-900">Gastos Presupuestados</h2>
                    <span className="text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        Límites
                    </span>
                </div>

                {expenseBudgets.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-rose-100/50 bg-rose-50/30 rounded-3xl">
                        <p className="text-rose-400 font-medium text-sm">No hay presupuestos de gasto definidos.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {expenseBudgets.map((budget) => {
                            const executed = getExecutedAmount(budget.ministry?.id, budget.category?.id);
                            const limit = Number(budget.amountLimit);
                            const progress = limit > 0 ? (executed / limit) * 100 : 0;
                            // For EXPENSE: Red if Executed > Limit is BAD (over budget)
                            const isOver = executed > limit;

                            return (
                                <Card key={budget.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group bg-white">
                                    <CardHeader className="pb-3 border-b border-slate-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-sm font-bold text-slate-800">{budget.category?.name || 'General'}</CardTitle>
                                                {budget.ministry && <CardDescription className="text-xs font-medium text-slate-500">{budget.ministry.name}</CardDescription>}
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
                                                className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-right font-bold text-slate-400">
                                            {progress.toFixed(1)}% Consumido
                                        </p>
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

    // New State for UI Logic
    const [type, setType] = useState<string>('expense'); // 'income' | 'expense'

    const [form, setForm] = useState({
        ministryId: '',
        categoryId: '',
        amountLimit: '',
        period: 'yearly',
        year: year
    });

    // Filter categories based on selected type
    const filteredCategories = categories.filter((c: any) => c.type === type);

    const handleSave = async () => {
        if (!form.categoryId || !form.amountLimit) {
            toast.error('Debes seleccionar una Categoría y definir un monto.');
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
                        {type === 'income' ? 'Estima los ingresos esperados' : 'Asigna límites de gasto'} para {year}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* TYPE SELECTOR */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Tipo de Presupuesto</Label>
                        <Select value={type} onValueChange={(val) => { setType(val); setForm({ ...form, categoryId: '' }); }}>
                            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-100 font-semibold text-slate-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Ingresos (Estimación)</SelectItem>
                                <SelectItem value="expense">Egresos (Gastos)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Categoría ({type === 'income' ? 'Ingreso' : 'Egreso'})</Label>
                        <Select value={form.categoryId} onValueChange={(val) => setForm({ ...form, categoryId: val })}>
                            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-100">
                                <SelectValue placeholder="Seleccionar Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredCategories.length === 0 ? (
                                    <div className="p-2 text-xs text-slate-400 text-center">No hay categorías de {type === 'income' ? 'ingreso' : 'gasto'} disponibles.</div>
                                ) : (
                                    filteredCategories.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Ministerio (Opcional)</Label>
                        <Select value={form.ministryId} onValueChange={(val) => setForm({ ...form, ministryId: val === 'none' ? '' : val })}>
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
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                            {type === 'income' ? 'Monto Estimado' : 'Monto Límite'} (Anual)
                        </Label>
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
                    <Button onClick={handleSave} disabled={loading} className={`w-full font-bold h-11 rounded-xl ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary'}`}>
                        {loading ? 'Guardando...' : 'Guardar Presupuesto'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
