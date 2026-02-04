'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, MoreHorizontal, UserCheck, Trash2, Edit, Archive, ArchiveRestore } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import api from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROLE_UI_METADATA } from '@/constants/role-ui';
import { FollowUpStatus } from '@/types/auth-types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

export default function VisitorsPage() {
    const { user } = useAuth();
    const [visitors, setVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filters
    const [statusFilter, setStatusFilter] = useState('ACTIVE'); // ACTIVE, VISITOR, PROSPECT, ARCHIVED

    // Create State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

    // Edit State
    const [editingVisitor, setEditingVisitor] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '', status: '' });


    // Confirm Action State
    const [actionState, setActionState] = useState<{ type: 'DELETE' | 'PROMOTE' | 'ARCHIVE' | null, data: any | null }>({ type: null, data: null });

    const canManage = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            let statuses = '';
            if (statusFilter === 'ACTIVE') {
                statuses = 'VISITOR,PROSPECT';
            } else if (statusFilter === 'ARCHIVED') {
                statuses = 'ARCHIVED';
            } else {
                statuses = statusFilter;
            }

            const res = await api.get(`/follow-ups?status=${statuses}`);
            setVisitors(res.data);
        } catch (error) {
            console.error('Failed to fetch visitors', error);
            toast.error('Error al cargar visitantes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisitors();
    }, [statusFilter]);

    const handleCreate = async () => {
        if (!createForm.firstName || !createForm.lastName) {
            toast.error('Nombre y Apellido son requeridos');
            return;
        }

        try {
            await api.post('/follow-ups', createForm);
            toast.success('Visitante creado exitosamente');
            setIsCreateOpen(false);
            setCreateForm({ firstName: '', lastName: '', email: '', phone: '' });
            fetchVisitors();
        } catch (error) {
            console.error(error);
            toast.error('Error al crear visitante');
        }
    };

    const openEdit = (visitor: any) => {
        setEditingVisitor(visitor);
        setEditForm({
            firstName: visitor.firstName,
            lastName: visitor.lastName || '',
            email: visitor.email || '',
            phone: visitor.phone || '',
            status: visitor.status || 'VISITOR'
        });
    };

    const handleUpdate = async () => {
        if (!editingVisitor) return;
        try {
            await api.put(`/follow-ups/${editingVisitor.id}`, editForm);
            toast.success('Datos actualizados');
            setEditingVisitor(null);
            fetchVisitors();
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };


    const executeAction = async () => {
        if (!actionState.data || !actionState.type) return;

        try {
            if (actionState.type === 'DELETE') {
                // Hard Delete
                try {
                    await api.delete(`/follow-ups/${actionState.data.id}`);
                    toast.success('Visitante eliminado permanentemente');
                } catch (err: any) {
                    // Smart Delete Logic Check:
                    // Usually 409 Conflict or 500 error due to FK constraint
                    if (err.response && (err.response.status === 409 || err.response.status === 500)) {
                        toast.warning('No se pudo borrar por tener historial. Archivando en su lugar...');
                        // Fallback to Archive
                        await api.put(`/follow-ups/${actionState.data.id}/status`, { status: 'ARCHIVED' });
                        toast.success('Visitante archivado por seguridad');
                    } else {
                        throw err;
                    }
                }
            } else if (actionState.type === 'PROMOTE') {
                await api.post(`/follow-ups/${actionState.data.id}/promote-member`);
                toast.success('Promovido a miembro correctamente');
            } else if (actionState.type === 'ARCHIVE') {
                // Soft Archive
                await api.put(`/follow-ups/${actionState.data.id}/status`, { status: 'ARCHIVED' });
                toast.success('Visitante archivado');
            }
            fetchVisitors();
        } catch (error) {
            console.error(error);
            toast.error('Error al procesar la acción');
        } finally {
            setActionState({ type: null, data: null });
        }
    };

    const filteredVisitors = visitors.filter(v =>
        `${v.firstName} ${v.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedVisitors = filteredVisitors.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <ErrorBoundary sectionName="Visitantes">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Visitantes</h1>
                        <p className="text-gray-500 mt-1">Gestión de personas que visitan la iglesia</p>
                    </div>
                    {canManage && (
                        <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Visitante
                        </Button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Dynamic Filter Select */}
                    <div className="w-[200px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Todos (Activos)</SelectItem>
                                <SelectItem value="VISITOR">Solo Visitantes</SelectItem>
                                <SelectItem value="PROSPECT">Candidatos</SelectItem>
                                <SelectItem value="ARCHIVED">Archivados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Primera Visita</th>
                                    <th className="px-6 py-4">Estado</th>
                                    {canManage && <th className="px-6 py-4 text-right">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedVisitors.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No se encontraron visitantes.
                                        </td>
                                    </tr>
                                )}
                                {paginatedVisitors.map((visitor) => (
                                    <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                                                    {visitor.firstName?.substring(0, 1)}{visitor.lastName?.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{visitor.firstName} {visitor.lastName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-600">{visitor.email || '-'}</span>
                                                <span className="text-xs text-gray-400">{visitor.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {visitor.firstVisitDate ? new Date(visitor.firstVisitDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {visitor.status && ROLE_UI_METADATA[visitor.status as keyof typeof ROLE_UI_METADATA] ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_UI_METADATA[visitor.status as keyof typeof ROLE_UI_METADATA].color}`}>
                                                    {ROLE_UI_METADATA[visitor.status as keyof typeof ROLE_UI_METADATA].label}
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                    {visitor.status}
                                                </span>
                                            )}
                                        </td>
                                        {canManage && (
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        {visitor.status !== 'ARCHIVED' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => setActionState({ type: 'PROMOTE', data: visitor })}>
                                                                    <UserCheck className="mr-2 h-4 w-4" /> Promover a Miembro
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => setActionState({ type: 'ARCHIVE', data: visitor })}>
                                                                    <Archive className="mr-2 h-4 w-4" /> Dar de Baja
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuItem onClick={() => openEdit(visitor)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Editar Datos
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => setActionState({ type: 'DELETE', data: visitor })} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Definitivamente
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span>Filas por página:</span>
                            <select
                                className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="ml-2">
                                Mostrando {Math.min((currentPage - 1) * rowsPerPage + 1, filteredVisitors.length)} - {Math.min(currentPage * rowsPerPage, filteredVisitors.length)} de {filteredVisitors.length}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredVisitors.length / rowsPerPage), p + 1))}
                                disabled={currentPage >= Math.ceil(filteredVisitors.length / rowsPerPage)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Create Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nuevo Visitante</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre *</Label>
                                    <Input value={createForm.firstName} onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Apellido *</Label>
                                    <Input value={createForm.lastName} onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreate}>Crear</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={!!editingVisitor} onOpenChange={(o) => !o && setEditingVisitor(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Visitante</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre *</Label>
                                    <Input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Apellido *</Label>
                                    <Input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono</Label>
                                    <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Select
                                    value={editForm.status}
                                    onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VISITOR">Visitante</SelectItem>
                                        <SelectItem value="PROSPECT">Candidato a Miembro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingVisitor(null)}>Cancelar</Button>
                            <Button onClick={handleUpdate}>Guardar Cambios</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Confirm Dialog */}
                <AlertDialog open={!!actionState.type} onOpenChange={(open) => !open && setActionState({ type: null, data: null })}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {actionState.type === 'DELETE' && '¿Eliminar Definitivamente?'}
                                {actionState.type === 'ARCHIVE' && '¿Dar de Baja?'}
                                {actionState.type === 'PROMOTE' && '¿Promover a Miembro?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {actionState.type === 'DELETE' && 'Esta acción borrará permanentemente todos los datos y es irreversible.'}
                                {actionState.type === 'ARCHIVE' && 'El visitante será movido a "Archivados" y no aparecerá en la lista principal.'}
                                {actionState.type === 'PROMOTE' && `¿Estás seguro de que deseas promover a ${actionState.data?.firstName} a Miembro?`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={executeAction}
                                className={actionState.type === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : ''}
                            >
                                {actionState.type === 'DELETE' ? 'Eliminar Definitivamente' : 'Confirmar'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ErrorBoundary>
    );
}
