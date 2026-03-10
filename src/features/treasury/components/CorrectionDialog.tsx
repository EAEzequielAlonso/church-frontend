import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TreasuryTransactionModel } from '../types/treasury.types';
import { useAuth } from '@/context/AuthContext';
import { treasuryApi } from '@/app/(dashboard)/treasury/services/treasuryApi';
import { useIsPeriodClosed } from '../hooks/usePeriods';

interface CorrectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionToCorrect: TreasuryTransactionModel | null;
    onSuccess?: () => void;
}

export function CorrectionDialog({ open, onOpenChange, transactionToCorrect, onSuccess }: CorrectionDialogProps) {
    const { user, churchId } = useAuth();
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dateToCheck = transactionToCorrect ? new Date(transactionToCorrect.date) : new Date();
    const { isClosed: isPeriodClosed } = useIsPeriodClosed(churchId || '', dateToCheck.getFullYear(), dateToCheck.getMonth() + 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !transactionToCorrect) return;

        setIsLoading(true);
        setError(null);

        try {
            await treasuryApi.transactions.correct(transactionToCorrect.id, {
                userId: user.id,
                reason,
            });
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Corregir Transacción</DialogTitle>
                </DialogHeader>

                <div className="bg-amber-50 rounded-md p-3 text-sm text-amber-800 border border-amber-200 mb-4">
                    <strong>Atención:</strong> Esta acción anulará la transacción actual y creará un duplicado exacto pero inverso, así como un registro de corrección. Los saldos de las cuentas se ajustarán automáticamente.
                </div>

                {isPeriodClosed && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-md text-sm mb-4">
                        <strong>Período Cerrado:</strong> No es posible aplicar correcciones sobre transacciones de un mes cerrado.
                    </div>
                )}

                <div className="space-y-2 mb-4">
                    <div className="text-sm">
                        <span className="font-semibold">Transacción Original:</span> {transactionToCorrect.description}
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Monto:</span> {transactionToCorrect.displayAmount}
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Fecha:</span> {new Intl.DateTimeFormat('es-AR').format(new Date(transactionToCorrect.date))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="flex justify-end gap-2">
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
