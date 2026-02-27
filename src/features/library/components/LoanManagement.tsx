import { useState } from 'react';
import { useLoans, useLibraryMutations } from '../hooks/useLibrary';
import { LoanStatus } from '../types/library.types';
import { LOAN_STATUS_LABELS, LOAN_STATUS_COLORS } from '../utils/loan-status.utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Check, X, Package, RotateCcw } from 'lucide-react';

export function LoanManagement() {
    const [statusFilter, setStatusFilter] = useState<LoanStatus | 'ALL'>('ALL');
    const { data: loans, isLoading } = useLoans({
        status: statusFilter === 'ALL' ? undefined : statusFilter
    });

    const { approveLoan, deliverLoan, returnLoan } = useLibraryMutations();

    const handleAction = async (action: 'approve' | 'deliver' | 'return', id: string) => {
        try {
            if (action === 'approve') await approveLoan.mutateAsync(id);
            if (action === 'deliver') await deliverLoan.mutateAsync({ id });
            if (action === 'return') await returnLoan.mutateAsync({ id });
            toast.success('Acción realizada correctamente');
        } catch (error: any) {
            toast.error(`Error al procesar la acción: ${error.message}`);
        }
    };

    if (isLoading) return <div>Cargando préstamos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Gestión de Préstamos</h2>
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as LoanStatus | 'ALL')}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{LOAN_STATUS_LABELS['ALL']}</SelectItem>
                        {Object.values(LoanStatus).map((status) => (
                            <SelectItem key={status} value={status}>{LOAN_STATUS_LABELS[status]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loans?.map(loan => (
                    <Card key={loan.id} className="flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge className={`${LOAN_STATUS_COLORS[loan.status]} border-transparent`}>
                                    {LOAN_STATUS_LABELS[loan.status]}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(loan.requestedAt), 'dd MMM', { locale: es })}
                                </span>
                            </div>
                            <CardTitle className="text-base mt-2">{loan.book?.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">Solicitado por: {loan.borrower?.person?.firstName} {loan.borrower?.person?.lastName}</p>
                        </CardHeader>
                        <CardContent className="flex-grow text-sm space-y-2">
                            {loan.dueDate && (
                                <div className="flex justify-between">
                                    <span>Vence:</span>
                                    <span>{format(new Date(loan.dueDate), 'dd MMM yyyy', { locale: es })}</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-2 justify-end">
                            {loan.status === LoanStatus.REQUESTED && (
                                <>
                                    <Button size="sm" variant="outline" onClick={() => {/* Reject */ }}>
                                        <X className="h-4 w-4 mr-1" /> Rechazar
                                    </Button>
                                    <Button size="sm" onClick={() => handleAction('approve', loan.id)}>
                                        <Check className="h-4 w-4 mr-1" /> Aprobar
                                    </Button>
                                </>
                            )}
                            {loan.status === LoanStatus.APPROVED && (
                                <Button size="sm" onClick={() => handleAction('deliver', loan.id)}>
                                    <Package className="h-4 w-4 mr-1" /> Marcar Entregado
                                </Button>
                            )}
                            {loan.status === LoanStatus.DELIVERED && (
                                <Button size="sm" variant="secondary" onClick={() => handleAction('return', loan.id)}>
                                    <RotateCcw className="h-4 w-4 mr-1" /> Recibir Devolución
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
                {loans?.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No hay préstamos en este estado.
                    </div>
                )}
            </div>
        </div>
    );
}
