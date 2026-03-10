'use client';

import { useState } from 'react';
import { InventoryItem } from '@/features/inventory/types/inventory.types';
import { useInventoryMovements } from '@/features/inventory/hooks/useInventory';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { INVENTORY_REASON_LABELS } from '@/features/inventory/types/inventory.types';

const LIMIT = 10;

export default function MovementHistory({ item }: { item: InventoryItem }) {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useInventoryMovements({ itemId: item.id, page, limit: LIMIT });

    if (isLoading) {
        return <div className="py-6 text-center text-sm text-slate-500">Cargando historial...</div>;
    }

    if (!data || data.data.length === 0) {
        return <div className="py-6 text-center text-sm text-slate-400">No hay movimientos registrados.</div>;
    }

    const { data: movements, lastPage, total } = data;

    return (
        <div className="space-y-3">
            <p className="text-xs text-slate-400">{total} movimiento{total !== 1 ? 's' : ''} en total</p>

            <div className="max-h-[380px] overflow-y-auto rounded-lg border border-slate-100">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="text-xs">Fecha</TableHead>
                            <TableHead className="text-xs">Tipo</TableHead>
                            <TableHead className="text-xs text-right">Cant.</TableHead>
                            <TableHead className="text-xs">Motivo</TableHead>
                            <TableHead className="text-xs">Usuario</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements.map((mov) => (
                            <TableRow key={mov.id} className="hover:bg-slate-50">
                                <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                    {new Date(mov.date).toLocaleDateString('es-AR', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                    })}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={mov.type === 'IN' ? 'secondary' : 'destructive'}
                                        className="text-[10px] font-bold"
                                    >
                                        {mov.type === 'IN' ? '▲ INGRESO' : '▼ EGRESO'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-bold text-right">{mov.quantity}</TableCell>
                                <TableCell>
                                    <div className="text-xs font-medium">
                                        {INVENTORY_REASON_LABELS[mov.reason] ?? mov.reason}
                                    </div>
                                    {mov.observation && (
                                        <div className="text-xs text-slate-400 italic line-clamp-1">
                                            {mov.observation}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-xs text-slate-500">
                                    {mov.registeredBy?.person?.fullName ?? 'Sistema'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex items-center justify-between pt-1">
                    <Button
                        variant="outline" size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-slate-500">
                        Página {page} de {lastPage}
                    </span>
                    <Button
                        variant="outline" size="sm"
                        onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                        disabled={page === lastPage}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
