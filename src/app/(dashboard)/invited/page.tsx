'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, MoreHorizontal, UserCheck, Trash2, Edit, Archive } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch'; // Ensure Switch exists or you might need to create it

export default function InvitedPage() {
    const { user } = useAuth();
    const [invited, setInvited] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filters
    const [showArchived, setShowArchived] = useState(false);

    // Create State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

    // Edit State
    const [editingInvited, setEditingInvited] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

    // Confirm Action State
    // Confirm Action State
    const [actionState, setActionState] = useState<{ type: 'DELETE' | 'PROMOTE' | 'ARCHIVE' | null, data: any | null }>({ type: null, data: null });

    const canManage = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';

    const fetchInvited = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/invited-people?includeArchived=${showArchived}`);
            setInvited(res.data);
        } catch (error) {
            console.error('Failed to fetch invited', error);
            toast.error('Error al cargar invitados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvited();
    }, [showArchived]);

    const handleCreate = async () => {
        if (!createForm.firstName || !createForm.lastName) {
            toast.error('Nombre y Apellido son requeridos');
            return;
        }

        try {
            await api.post('/invited-people', createForm);
            toast.success('Invitado creado exitosamente');
            setIsCreateOpen(false);
            setCreateForm({ firstName: '', lastName: '', email: '', phone: '' });
            fetchInvited();
        } catch (error) {
            console.error(error);
            toast.error('Error al crear invitado');
        }
    };

    const openEdit = (person: any) => {
        setEditingInvited(person);
        setEditForm({
            firstName: person.firstName,
            lastName: person.lastName || '',
            email: person.email || '',
            phone: person.phone || ''
        });
    };

    const handleUpdate = async () => {
        if (!editingInvited) return;
        try {
            await api.put(`/invited-people/${editingInvited.id}`, editForm);
            toast.success('Datos actualizados');
            setEditingInvited(null);
            fetchInvited();
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
                    await api.delete(`/invited-people/${actionState.data.id}`);
                    toast.success('Invitado eliminado permanentemente');
                } catch (err: any) {
                    if (err.response && (err.response.status === 409 || err.response.status === 500)) {
                        toast.warning('No se pudo borrar por tener historial. Intente "Dar de Baja".');
                    } else {
                        toast.error('Error al eliminar');
                    }
                }
            } else if (actionState.type === 'ARCHIVE') {
                // Soft Delete
                await api.put(`/invited-people/${actionState.data.id}/archive`);
                toast.success('Invitado dado de baja');
            } else if (actionState.type === 'PROMOTE') {
                await api.post(`/invited-people/${actionState.data.id}/promote-visitor`);
                toast.success('Promovido a Visitante correctamente');
            }
            fetchInvited();
        } catch (error) {
            console.error(error);
            // toast.error('Error al procesar la acción');
        } finally {
            setActionState({ type: null, data: null });
        }
    };

    const filteredInvited = invited.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedInvited = filteredInvited.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <ErrorBoundary sectionName="Invitados">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Invitados</h1>
                        <p className="text-gray-500 mt-1">Personas invitadas que aún no son visitantes frecuentes</p>
                    </div>
                    {canManage && (
                        <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Invitado
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

                    <div className="flex items-center gap-2">
                        <Label htmlFor="show-archived" className="text-sm text-gray-600 whitespace-nowrap">Mostrar Archivados</Label>
                        <Switch
                            id="show-archived"
                            checked={showArchived}
                            onCheckedChange={setShowArchived}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Fecha Creación</th>
                                    {canManage && <th className="px-6 py-4 text-right">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedInvited.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No se encontraron invitados.
                                        </td>
                                    </tr>
                                )}
                                {paginatedInvited.map((person) => (
                                    <tr key={person.id} className={`hover:bg-gray-50 transition-colors ${person.deletedAt ? 'bg-gray-50 opacity-60' : ''}`}>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${person.deletedAt ? 'bg-gray-200 text-gray-500' : 'bg-orange-100 text-orange-700'}`}>
                                                    {person.firstName?.substring(0, 1)}{person.lastName?.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                                        {person.firstName} {person.lastName}
                                                        {person.deletedAt && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded">Archivado</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-600">{person.email || '-'}</span>
                                                <span className="text-xs text-gray-400">{person.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {person.createdAt ? new Date(person.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        {canManage && !person.deletedAt && (
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setActionState({ type: 'PROMOTE', data: person })}>
                                                            <UserCheck className="mr-2 h-4 w-4" /> Promover a Visitante
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setActionState({ type: 'ARCHIVE', data: person })}>
                                                            <Archive className="mr-2 h-4 w-4" /> Dar de Baja
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEdit(person)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Editar Datos
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => setActionState({ type: 'DELETE', data: person })} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Definitivamente
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        )}
                                        {canManage && person.deletedAt && (
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs text-gray-400 italic">Dado de baja</span>
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
                                Mostrando {Math.min((currentPage - 1) * rowsPerPage + 1, filteredInvited.length)} - {Math.min(currentPage * rowsPerPage, filteredInvited.length)} de {filteredInvited.length}
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
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredInvited.length / rowsPerPage), p + 1))}
                                disabled={currentPage >= Math.ceil(filteredInvited.length / rowsPerPage)}
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
                            <DialogTitle>Nuevo Invitado</DialogTitle>
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
                <Dialog open={!!editingInvited} onOpenChange={(o) => !o && setEditingInvited(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Invitado</DialogTitle>
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
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingInvited(null)}>Cancelar</Button>
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
                                {actionState.type === 'PROMOTE' && '¿Promover a Visitante?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {actionState.type === 'DELETE' && 'Esta acción borrará permanentemente todos los datos y es irreversible.'}
                                {actionState.type === 'ARCHIVE' && 'El invitado será movido a "Archivados" y no aparecerá en la lista de activos.'}
                                {actionState.type === 'PROMOTE' && `¿Estás seguro de mover a ${actionState.data?.firstName} a la lista de Visitantes?`}
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
