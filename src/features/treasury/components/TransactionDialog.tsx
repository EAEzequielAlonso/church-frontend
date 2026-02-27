import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreasuryAccountModel, TreasuryTransactionModel, AccountType } from '../types/treasury.types';
import { useAuth } from '@/context/AuthContext';
import { useCreateTransaction } from '../hooks/useCreateTransaction';
import { useUpdateTransaction } from '../hooks/useUpdateTransaction';
import { useMinistries } from '../hooks/useMinistries';
import { useCategories } from '../hooks/useCategories'; // NEW

interface TransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: TreasuryAccountModel[];
    transactionToEdit?: TreasuryTransactionModel | null; // If present, Edit Mode
    onSuccess?: () => void;
}

export function TransactionDialog({ open, onOpenChange, accounts, transactionToEdit, onSuccess }: TransactionDialogProps) {
    const { churchId, user } = useAuth();
    const createHook = useCreateTransaction();
    const updateHook = useUpdateTransaction();
    const { ministries } = useMinistries();

    // Hooks for categories (could optimize to fetch all once or filter locally if needed)
    const { categories: incomeCategories } = useCategories('income');
    const { categories: expenseCategories } = useCategories('expense');


    const isLoading = createHook.isLoading || updateHook.isLoading;

    const [type, setType] = useState<'income' | 'expense' | 'transfer'>('income');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    // Unified state for accounts/categories logic
    // Income: source = categoryId, dest = accountId
    // Expense: source = accountId, dest = categoryId
    // Transfer: source = accountId, dest = accountId
    const [sourceId, setSourceId] = useState('');
    const [destId, setDestId] = useState('');

    const [exchangeRate, setExchangeRate] = useState('1');
    const [ministryId, setMinistryId] = useState<string>('none');

    // Filter ASSET accounts for actual money movement
    const assetAccounts = accounts.filter(a => a.type === AccountType.ASSET);

    // Initial Load for Edit
    useEffect(() => {
        if (open) {
            if (transactionToEdit) {
                // Populate form
                setAmount(transactionToEdit.amount.toString());
                setDescription(transactionToEdit.description);

                if (transactionToEdit.isIncome) {
                    setType('income');
                    // For Income: source is Category, dest is Account
                    setSourceId(transactionToEdit.categoryId || '');
                    setDestId(transactionToEdit.destinationAccountId || '');
                } else if (transactionToEdit.isExpense) {
                    setType('expense');
                    // For Expense: source is Account, dest is Category
                    setSourceId(transactionToEdit.sourceAccountId || '');
                    setDestId(transactionToEdit.categoryId || '');
                    setMinistryId(transactionToEdit.ministryName ? 'found-by-name-fix-later' : 'none'); // TODO: Fix id binding
                } else {
                    setType('transfer');
                    setSourceId(transactionToEdit.sourceAccountId || '');
                    setDestId(transactionToEdit.destinationAccountId || '');
                    setExchangeRate(transactionToEdit.exchangeRate?.toString() || '1');
                }
            } else {
                // Reset
                setAmount('');
                setDescription('');
                setSourceId('');
                setDestId('');
                setExchangeRate('1');
                setMinistryId('none');
                setType('income');
            }
        }
    }, [open, transactionToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!churchId || !user) return;

        // Determine currency from source account (if applicable) or default
        // For Income: dest is account
        // For Expense/Transfer: source is account
        let currency = 'ARS';
        if (type === 'income') {
            const destAcc = accounts.find(a => a.id === destId);
            if (destAcc) currency = destAcc.currency;
        } else {
            const sourceAcc = accounts.find(a => a.id === sourceId);
            if (sourceAcc) currency = sourceAcc.currency;
        }

        // Logic to mapping IDs to DTO
        let categoryId: string | undefined;
        let sourceAccountId: string | undefined;
        let destinationAccountId: string | undefined;

        if (type === 'income') {
            categoryId = sourceId;
            destinationAccountId = destId;
        } else if (type === 'expense') {
            sourceAccountId = sourceId;
            categoryId = destId;
        } else { // Transfer
            sourceAccountId = sourceId;
            destinationAccountId = destId;
        }

        const common = {
            churchId,
            description,
            amount: parseFloat(amount),
            currency,
            exchangeRate: parseFloat(exchangeRate) || 1,
            categoryId,
            sourceAccountId,
            destinationAccountId,
            ministryId: (type === 'expense' && ministryId !== 'none') ? ministryId : undefined,
        };

        if (transactionToEdit) {
            await updateHook.execute(transactionToEdit.id, {
                ...common,
                id: transactionToEdit.id,
                userId: user.id
            }, () => {
                onOpenChange(false);
                onSuccess?.();
            });
        } else {
            // Check for valid IDs based on type before submitting? form required should handle it
            await createHook.execute({
                ...common,
            }, () => {
                onOpenChange(false);
                onSuccess?.();
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{transactionToEdit ? 'Editar Transacción' : 'Nueva Transacción'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        <Button type="button" variant={type === 'income' ? 'default' : 'outline'} onClick={() => setType('income')} disabled={!!transactionToEdit}>Ingreso</Button>
                        <Button type="button" variant={type === 'expense' ? 'default' : 'outline'} onClick={() => setType('expense')} disabled={!!transactionToEdit}>Gasto</Button>
                        <Button type="button" variant={type === 'transfer' ? 'default' : 'outline'} onClick={() => setType('transfer')} disabled={!!transactionToEdit}>Transfer</Button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Monto</label>
                        <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción</label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} required />
                    </div>

                    {/* Dynamic Selects based on Type */}
                    {type === 'income' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría (Ingreso)</label>
                                <Select onValueChange={setSourceId} value={sourceId} required>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar Categoría" /></SelectTrigger>
                                    <SelectContent>
                                        {incomeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cuenta Destino</label>
                                <Select onValueChange={setDestId} value={destId} required>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar Cuenta" /></SelectTrigger>
                                    <SelectContent>
                                        {assetAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    {type === 'expense' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cuenta Origen</label>
                                <Select onValueChange={setSourceId} value={sourceId} required>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar Cuenta" /></SelectTrigger>
                                    <SelectContent>
                                        {assetAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría (Gasto)</label>
                                <Select onValueChange={setDestId} value={destId} required>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar Categoría" /></SelectTrigger>
                                    <SelectContent>
                                        {expenseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Ministerio (Opcional)</label>
                                <Select onValueChange={setMinistryId} value={ministryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Ministerio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Ninguno</SelectItem>
                                        {ministries.map(m => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    {type === 'transfer' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cuenta Origen</label>
                                <Select onValueChange={setSourceId} value={sourceId} required>
                                    <SelectTrigger><SelectValue placeholder="Desde" /></SelectTrigger>
                                    <SelectContent>
                                        {assetAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cuenta Destino</label>
                                <Select onValueChange={setDestId} value={destId} required>
                                    <SelectTrigger><SelectValue placeholder="Hasta" /></SelectTrigger>
                                    <SelectContent>
                                        {assetAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Tipo de Cambio (Opcional)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="1.00"
                                    value={exchangeRate}
                                    onChange={e => setExchangeRate(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
