import { useState } from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditEntityType, AuditAction } from '../types/treasury.types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { AuditLogDto } from '../types/audit.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Helper view for details diff
function AuditDetailsModal({ open, onOpenChange, log }: { open: boolean, onOpenChange: (open: boolean) => void, log: AuditLogDto | null }) {
    if (!log) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalle del Evento de Auditoría</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Estado Anterior</label>
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-md text-xs overflow-auto max-h-96">
                            {JSON.stringify(log.before || {}, null, 2)}
                        </pre>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Estado Nuevo</label>
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-md text-xs overflow-auto max-h-96">
                            {JSON.stringify(log.after || {}, null, 2)}
                        </pre>
                    </div>
                </div>

                {log.reason && (
                    <div className="mt-4 p-3 bg-slate-100 border rounded text-sm text-slate-700">
                        <strong>Motivo / Razón:</strong> {log.reason}
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function AuditTrailViewer() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [entityType, setEntityType] = useState<string>('all');
    const [action, setAction] = useState<string>('all');

    const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

    const { data, isLoading, error } = useAuditLogs({
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        entityType: entityType !== 'all' ? entityType : undefined,
        action: action !== 'all' ? action : undefined,
        limit,
        page
    });

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setEntityType('all');
        setAction('all');
        setPage(1);
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Registro de Auditoría</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border">
                <div>
                    <label className="text-sm font-medium mb-1 block">Desde</label>
                    <Input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">Hasta</label>
                    <Input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">Entidad</label>
                    <Select value={entityType} onValueChange={(val) => { setEntityType(val); setPage(1); }}>
                        <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value={AuditEntityType.ACCOUNT}>Cuentas</SelectItem>
                            <SelectItem value={AuditEntityType.TRANSACTION}>Transacciones</SelectItem>
                            <SelectItem value={AuditEntityType.BUDGET}>Presupuestos</SelectItem>
                            <SelectItem value={AuditEntityType.PERIOD}>Períodos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">Acción</label>
                    <Select value={action} onValueChange={(val) => { setAction(val); setPage(1); }}>
                        <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value={AuditAction.CREATE}>Crear</SelectItem>
                            <SelectItem value={AuditAction.UPDATE}>Actualizar</SelectItem>
                            <SelectItem value={AuditAction.DELETE}>Eliminar</SelectItem>
                            <SelectItem value={AuditAction.CORRECT}>Corrección</SelectItem>
                            <SelectItem value={AuditAction.CLOSE_PERIOD}>Cerrar Período</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-4 flex justify-end">
                    <Button variant="ghost" onClick={handleClearFilters}>Limpiar Filtros</Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-md">
                    Ocurrió un error cargando el registro. Contacte a soporte técnico.
                </div>
            )}

            <div className="rounded-md border bg-white overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b bg-slate-50/50">
                            <th className="font-semibold px-4 py-3 text-left">Fecha</th>
                            <th className="font-semibold px-4 py-3 text-left">Usuario</th>
                            <th className="font-semibold px-4 py-3 text-left">Acción</th>
                            <th className="font-semibold px-4 py-3 text-left">Entidad</th>
                            <th className="font-semibold px-4 py-3 text-left">Motivo</th>
                            <th className="font-semibold px-4 py-3 text-right">Detalles</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading && (
                            <tr>
                                <td colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center flex-col items-center text-slate-500">
                                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                        Cargando logs...
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!isLoading && data?.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="h-24 text-center text-slate-500">
                                    No se encontraron registros de auditoría que coincidan con los filtros.
                                </td>
                            </tr>
                        )}
                        {!isLoading && data?.data.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 whitespace-nowrap">{format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900">{log.performedByEmail || 'Sistema'}</div>
                                    <div className="text-xs text-slate-500">{log.performedByRole}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold
                                        ${log.action === AuditAction.CREATE ? 'bg-emerald-100 text-emerald-800' : ''}
                                        ${log.action === AuditAction.UPDATE ? 'bg-blue-100 text-blue-800' : ''}
                                        ${log.action === AuditAction.DELETE ? 'bg-rose-100 text-rose-800' : ''}
                                        ${log.action === AuditAction.CORRECT ? 'bg-amber-100 text-amber-800' : ''}
                                        ${log.action === AuditAction.CLOSE_PERIOD ? 'bg-purple-100 text-purple-800' : ''}
                                   `}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {log.entityType} ({log.entityId.slice(0, 8)}...)
                                </td>
                                <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={log.reason}>
                                    {log.reason || '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>Ver Cambios</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!isLoading && data && data.total > limit && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, data.total)} de {data.total} entradas</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * limit >= data.total}>Siguiente</Button>
                    </div>
                </div>
            )}

            <AuditDetailsModal open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)} log={selectedLog} />
        </div>
    );
}

