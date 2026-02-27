
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionAuditLog } from './TransactionAuditLog';

interface TransactionHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionId: string | null;
}

export function TransactionHistoryDialog({ open, onOpenChange, transactionId }: TransactionHistoryDialogProps) {
    if (!transactionId) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Historial de Cambios</DialogTitle>
                </DialogHeader>
                <TransactionAuditLog transactionId={transactionId} />
            </DialogContent>
        </Dialog>
    );
}
