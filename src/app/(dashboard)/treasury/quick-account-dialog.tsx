import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function QuickAccountDialog({ onSuccess, trigger }: { onSuccess: () => void, trigger?: React.ReactNode }) {
    const { churchId } = useAuth();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('asset');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/treasury/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name, type, currency: 'ARS', balance: 0 })
            });
            setOpen(false);
            onSuccess();
            setName('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="ghost" size="sm" className="text-xs">Configurar Cuentas</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Configuración Financiera</DialogTitle>
                    <p className="text-sm text-gray-500">Crea cuentas donde guardas dinero o categorías para clasificar movimientos.</p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className={`border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-colors ${type === 'asset' || type === 'liability' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-gray-200'}`}
                                onClick={() => setType('asset')}
                            >
                                <p className="font-semibold text-sm">Cuenta Real</p>
                                <p className="text-xs text-gray-500 mt-1">Donde está el dinero (Banco, Caja, Billetera).</p>
                            </div>
                            <div
                                className={`border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-colors ${type === 'income' || type === 'expense' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-gray-200'}`}
                                onClick={() => setType('income')}
                            >
                                <p className="font-semibold text-sm">Categoría</p>
                                <p className="text-xs text-gray-500 mt-1">Concepto contable (Diezmos, Luz, Limpieza).</p>
                            </div>
                        </div>

                        {type === 'asset' && (
                            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-md">
                                Creando una cuenta de activos. Ejemplo: "Banco Galicia", "Caja Chica".
                            </div>
                        )}
                        {(type === 'income' || type === 'expense') && (
                            <div className="bg-orange-50 text-orange-800 text-xs p-3 rounded-md">
                                <Select onValueChange={setType} defaultValue="income">
                                    <SelectTrigger className="h-8 w-full bg-white border-orange-200 mt-1"><SelectValue placeholder="Tipo de Categoría" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">Categoría de INGRESO (Ej. Ofrendas)</SelectItem>
                                        <SelectItem value="expense">Categoría de GASTO (Ej. Insumos)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre</label>
                            <Input placeholder="Ej. Banco Santander" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        {type === 'asset' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Moneda</label>
                                    <Select defaultValue="ARS">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ARS">ARS ($)</SelectItem>
                                            <SelectItem value="USD">USD (u$s)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Saldo Inicial</label>
                                    <Input type="number" placeholder="0.00" />
                                </div>
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>Crear</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
