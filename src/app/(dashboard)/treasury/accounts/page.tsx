'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
    Plus,
    ArrowLeft,
    Wallet,
    TrendingUp,
    TrendingDown,
    Edit2,
    Trash2,
    AlertTriangle,
    Search
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { QuickAccountDialog } from '../quick-account-dialog';

export default function AccountsManagementPage() {
    const { churchId } = useAuth();
    const router = useRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [editingAccount, setEditingAccount] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const fetchData = async () => {
        if (!churchId) return;
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/accounts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setAccounts(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [churchId]);

    const handleSave = async (data: any) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const url = editingAccount
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/accounts/${editingAccount.id}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/accounts`;

            const res = await fetch(url, {
                method: editingAccount ? 'PATCH' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                toast.success(editingAccount ? 'Cuenta actualizada' : 'Cuenta creada');
                fetchData();
                setEditingAccount(null);
                setShowWarning(false);
            }
        } catch (error) {
            toast.error('Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta cuenta?')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/accounts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                toast.success('Cuenta eliminada');
                fetchData();
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || 'Error al eliminar la cuenta');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const filteredAccounts = accounts.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const assetAccounts = filteredAccounts.filter(a => a.type === 'asset');
    const incomeCategories = filteredAccounts.filter(a => a.type === 'income');
    const expenseCategories = filteredAccounts.filter(a => a.type === 'expense');

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/treasury')} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Configuración</h1>
                        <p className="text-sm font-medium text-slate-500">Administra cuentas reales y categorías contables.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <QuickAccountDialog
                        onSuccess={fetchData}
                        trigger={
                            <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 shadow-lg shadow-primary/20 rounded-xl">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Nuevo
                            </Button>
                        }
                    />
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Buscar cuenta o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 bg-white border-slate-100 shadow-sm rounded-2xl focus:ring-primary/20 transition-all font-medium"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Assets */}
                <CardGroup
                    title="Cajas y Bancos"
                    icon={<Wallet className="w-4 h-4 text-primary" />}
                    accounts={assetAccounts}
                    onEdit={setEditingAccount}
                    onDelete={handleDelete}
                />

                {/* Income */}
                <CardGroup
                    title="Categorías de Ingreso"
                    icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                    accounts={incomeCategories}
                    onEdit={setEditingAccount}
                    onDelete={handleDelete}
                />

                {/* Expense */}
                <CardGroup
                    title="Categorías de Egreso"
                    icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
                    accounts={expenseCategories}
                    onEdit={setEditingAccount}
                    onDelete={handleDelete}
                />
            </div>

            {/* Warning Dialog for Editing */}
            <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
                <DialogContent className="sm:max-w-[450px] p-0 border-none shadow-2xl overflow-hidden">
                    <DialogHeader className="p-6 bg-slate-50/50 border-b border-slate-100">
                        <DialogTitle className="text-xl font-bold text-slate-800">Editar Cuenta</DialogTitle>
                    </DialogHeader>

                    {!showWarning ? (
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nombre</Label>
                                    <Input
                                        value={editingAccount?.name}
                                        onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                                        className="h-11 font-semibold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tipo</Label>
                                    <Select
                                        value={editingAccount?.type}
                                        onValueChange={(val) => setEditingAccount({ ...editingAccount, type: val })}
                                    >
                                        <SelectTrigger className="h-11 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asset">Activo (Caja/Banco)</SelectItem>
                                            <SelectItem value="income">Ingreso (Diezmos, etc)</SelectItem>
                                            <SelectItem value="expense">Egreso (Servicios, etc)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button
                                onClick={() => setShowWarning(true)}
                                className="w-full bg-primary text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20"
                            >
                                Guardar Cambios
                            </Button>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-amber-800 uppercase tracking-tight leading-none">Advertencia Crítica</p>
                                    <p className="text-xs font-medium text-amber-700 leading-relaxed">
                                        Modificar el nombre o tipo de esta cuenta afectará a todos los registros históricos asociados. Esto podría causar confusión en reportes pasados.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => handleSave(editingAccount)}
                                    disabled={isSaving}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 rounded-xl"
                                >
                                    {isSaving ? 'Guardando...' : 'Entiendo, Proceder'}
                                </Button>
                                <Button variant="ghost" onClick={() => setShowWarning(false)} className="font-bold text-slate-500">
                                    Volver atrás
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CardGroup({ title, icon, accounts, onEdit, onDelete }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2.5 px-2">
                <div className="p-2 bg-slate-50 rounded-lg">
                    {icon}
                </div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h2>
                <span className="ml-auto text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">{accounts.length}</span>
            </div>
            <div className="space-y-3">
                {accounts.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                        Vacío
                    </div>
                ) : (
                    accounts.map((acc: any) => (
                        <Card key={acc.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-slate-700 tracking-tight">{acc.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{acc.currency || 'ARS'}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(acc)} className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(acc.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

function AccountDialogContent({ onSave, isSaving }: any) {
    const [form, setForm] = useState({ name: '', type: 'asset', currency: 'ARS' });

    return (
        <DialogContent className="sm:max-w-[425px] border-none shadow-2xl p-6">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">Nueva Cuenta / Categoría</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Define un nuevo elemento en tu estructura contable.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nombre</Label>
                    <Input
                        placeholder="Ej: Banco Galicia, Ofrendas, Mantenimiento..."
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="h-11 border-slate-100 bg-slate-50/50 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Tipo de Cuenta</Label>
                    <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                        <SelectTrigger className="h-11 border-slate-100 bg-slate-50/50">
                            <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asset">Caja / Banco (Activo)</SelectItem>
                            <SelectItem value="income">Categoría de Ingreso</SelectItem>
                            <SelectItem value="expense">Categoría de Gasto</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Moneda</Label>
                    <Select value={form.currency} onValueChange={(val) => setForm({ ...form, currency: val })}>
                        <SelectTrigger className="h-11 border-slate-100 bg-slate-50/50">
                            <SelectValue placeholder="ARS" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                            <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button
                    onClick={() => onSave(form)}
                    disabled={isSaving || !form.name}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20"
                >
                    {isSaving ? 'Creando...' : 'Crear Cuenta'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
