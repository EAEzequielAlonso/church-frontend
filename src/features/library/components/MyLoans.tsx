import { useMyLoans } from '../hooks/useLibrary';
import { LOAN_STATUS_LABELS, LOAN_STATUS_COLORS } from '../utils/loan-status.utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function MyLoans() {
    const { data: loans, isLoading } = useMyLoans();

    if (isLoading) return <div>Cargando mis préstamos...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Mis Préstamos</h2>
            <div className="grid gap-4">
                {loans?.map(loan => (
                    <Card key={loan.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base">{loan.book?.title}</CardTitle>
                                <Badge className={`${LOAN_STATUS_COLORS[loan.status]} border-transparent`}>
                                    {LOAN_STATUS_LABELS[loan.status]}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground flex gap-4">
                                <span>Solicitado: {format(new Date(loan.requestedAt), 'dd MMM yyyy', { locale: es })}</span>
                                {loan.dueDate && (
                                    <span>Vence: {format(new Date(loan.dueDate), 'dd MMM yyyy', { locale: es })}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {loans?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No tienes préstamos registrados.
                    </div>
                )}
            </div>
        </div>
    );
}
