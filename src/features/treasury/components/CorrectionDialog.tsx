import { useState, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreasuryTransactionModel, TreasuryAccountModel, AccountType, TransactionType } from '../types/treasury.types';
import { useAuth } from '@/context/AuthContext';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { useIsPeriodClosed } from '../hooks/usePeriods';
import { useCategories } from '../hooks/useCategories';

interface CorrectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionToCorrect: TreasuryTransactionModel | null;
    accounts: TreasuryAccountModel[];
    onSuccess?: () => void;
}

export function CorrectionDialog({ open, onOpenChange, transactionToCorrect, accounts, onSuccess }: CorrectionDialogProps) {
    const { mutate } = useSWRConfig();
    const { user, churchId } = useAuth();
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form inputs matching the original tx type
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [sourceId, setSourceId] = useState('');
    const [destId, setDestId] = useState('');

    const { categories: incomeCategories } = useCategories('income');
    const { categories: expenseCategories } = useCategories('expense');
    const assetAccounts = accounts.filter(a => a.type === AccountType.ASSET);

    const dateToCheck = transactionToCorrect ? new Date(transactionToCorrect.date) : new Date();
    const { isClosed: isPeriodClosed } = useIsPeriodClosed(churchId || '', dateToCheck.getFullYear(), dateToCheck.getMonth() + 1);

    useEffect(() => {
        if (open && transactionToCorrect) {
            setAmount(transactionToCorrect.amount.toString());
            setDescription(transactionToCorrect.description || '');
            setReason('');
            
            if (transactionToCorrect.isIncome) {
                setSourceId(transactionToCorrect.categoryId || '');
                setDestId(transactionToCorrect.destinationAccountId || '');
            } else if (transactionToCorrect.isExpense) {
                setSourceId(transactionToCorrect.sourceAccountId || '');
                setDestId(transactionToCorrect.categoryId || '');
            } else {
                setSourceId(transactionToCorrect.sourceAccountId || '');
                setDestId(transactionToCorrect.destinationAccountId || '');
            }
        }
    }, [open, transactionToCorrect]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !transactionToCorrect) return;

        setIsLoading(true);
        setError(null);

        try {
            const data: any = {
                userId: user.id,
                reason,
            };

            const numAmount = parseFloat(amount);
            if (!isNaN(numAmount) && numAmount !== transactionToCorrect.amount) {
                data.newAmount = numAmount;
            }
            if (description && description !== transactionToCorrect.description) {
                data.newDescription = description;
            }

            if (transactionToCorrect.isIncome) {
                if (sourceId !== (transactionToCorrect.categoryId || '')) data.newCategoryId = sourceId;
                if (destId !== (transactionToCorrect.destinationAccountId || '')) data.newDestinationAccountId = destId;
            } else if (transactionToCorrect.isExpense) {
                if (sourceId !== (transactionToCorrect.sourceAccountId || '')) data.newSourceAccountId = sourceId;
                if (destId !== (transactionToCorrect.categoryId || '')) data.newCategoryId = destId;
            } else {
                if (sourceId !== (transactionToCorrect.sourceAccountId || '')) data.newSourceAccountId = sourceId;
                if (destId !== (transactionToCorrect.destinationAccountId || '')) data.newDestinationAccountId = destId;
            }

            await treasuryApi.transactions.correct(transactionToCorrect.id, data);
            
            // Invalidate cache to refresh the table
            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/transactions'));
            mutate((key) => typeof key === 'string' && key.startsWith('/treasury/accounts'));

            onSuccess?.();
            onOpenChange(false);
            setReason('');
        } catch (err: any) {
            setError(err.message || 'Error al corregir la transacción');
        } finally {
            setIsLoading(false);
        }
    };

    if (!transactionToCorrect) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Corregir Transacción</DialogTitle>
                </DialogHeader>

                <div className="bg-amber-50 rounded-md p-3 text-sm text-amber-800 border border-amber-200">
                    <strong>Atención:</strong> Esta acción anulará la transacción actual y creará un duplicado correcto, junto con un registro de auditoría.
                </div>

                {isPeriodClosed && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-md text-sm">
                        <strong>Período Cerrado:</strong> No es posible aplicar correcciones sobre el mes contabilizado cerrado.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descripción</label>
                            <Input value={description} onChange={e => setDescription(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Monto</label>
                            <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                        </div>
                    </div>

                    {transactionToCorrect.isIncome && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría (Ingreso)</label>
                                <Select onValueChange={setSourceId} value={sourceId}>
                                    <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                                    <SelectContent>
                                        {incomeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cuenta Destino</label>
                                <Select onValueChange={setDestId} value={destId}>
                                    <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                                    <SelectContent>
                                        {assetAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {transactionToCorrect.isExpense && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cuenta Origen</label>
                                <Select onValueChange={setSourceId} value={sourceId}>
                                    <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                                    <SelectContent>
                                        {assetAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría (Gasto)</label>
                                <Select onValueChange={setDestId} value={destId}>
                                    <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                                    <SelectContent>
                                        {expenseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {transactionToCorrect.isTransfer && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cuenta Origen</label>
                                <Select onValueChange={setSourceId} value={sourceId}>
                                    <SelectTrigger><SelectValue placeholder="Desde" /></SelectTrigger>
                                    <SelectContent>
                                        {assetAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cuenta Destino</label>
                                <Select onValueChange={setDestId} value={destId}>
                                    <SelectTrigger><SelectValue placeholder="Hasta" /></SelectTrigger>
                                    <SelectContent>
                                        {assetAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Razón de la Corrección</label>
                        <Input
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Ej. Monto incorrecto, cuenta equivocada..."
                            required
                        />
                    </div>

                    {error && <div className="text-sm text-rose-500">{error}</div>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="default" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading || !reason.trim() || isPeriodClosed}>
                            {isLoading ? 'Ejecutando...' : 'Aplicar Corrección'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
