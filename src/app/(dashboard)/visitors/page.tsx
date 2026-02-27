"use client";

import { useState } from 'react';
import { useFollowUps, FollowUpPerson } from '@/hooks/useFollowUps';
import { FollowUpsList } from '@/components/FollowUp/FollowUpsList';
import { FollowUpCreateDialog } from '@/components/FollowUp/FollowUpCreateDialog';
import { FollowUpEditDialog } from '@/components/FollowUp/FollowUpEditDialog';
import { AssignMemberDialog } from '@/components/FollowUp/AssignMemberDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SystemRole, FunctionalRole } from '@/types/auth-types';
import api from '@/lib/api';
import { toast } from 'sonner';
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

export default function VisitorsPage() {
    const { user } = useAuth();
    // Default to show all active (Visitors + Prospects), user can filter for specific or Archived
    const [status, setStatus] = useState<string>('VISITOR,PROSPECT');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [assignedToMe, setAssignedToMe] = useState(false);

    // Convert 'ALL' to undefined for the hook (so it fetches all)
    const queryStatus = status === 'ALL' ? undefined : status;
    const { data, meta, loading, error, refetch } = useFollowUps({ status: queryStatus, search, page, limit, assignedToMe });

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FollowUpPerson | null>(null);
    const [assigningItem, setAssigningItem] = useState<FollowUpPerson | null>(null);
    const [actionState, setActionState] = useState<{ type: 'DELETE' | 'ARCHIVE' | 'PROMOTE' | null, item: FollowUpPerson | null }>({ type: null, item: null });

    const canManage = user?.roles?.includes(FunctionalRole.ADMIN_CHURCH) ||
        user?.roles?.includes(FunctionalRole.AUDITOR) ||
        user?.systemRole === SystemRole.ADMIN_APP;

    const handleAction = (type: 'EDIT' | 'ARCHIVE' | 'PROMOTE' | 'DELETE' | 'ASSIGN', item: FollowUpPerson) => {
        if (type === 'EDIT') {
            setEditingItem(item);
        } else if (type === 'ASSIGN') {
            setAssigningItem(item);
        } else {
            setActionState({ type, item });
        }
    };

    const confirmAction = async () => {
        if (!actionState.item || !actionState.type) return;

        try {
            if (actionState.type === 'DELETE') {
                await api.delete(`/follow-ups/${actionState.item.id}`);
                toast.success('Eliminado correctamente');
            } else if (actionState.type === 'ARCHIVE') {
                await api.put(`/follow-ups/${actionState.item.id}/status`, { status: 'ARCHIVED' });
                toast.success('Archivado correctamente');
            } else if (actionState.type === 'PROMOTE') {
                await api.post(`/follow-ups/${actionState.item.id}/promote-member`);
                toast.success('Promovido a miembro correctamente');
            }
            refetch();
        } catch (error: any) {
            console.error(error);
            if (actionState.type === 'DELETE' && error.response?.status === 409) {
                toast.warning('No se pudo borrar por tener historial. Intente archivar.');
            } else {
                toast.error('Error al procesar la acción');
            }
        } finally {
            setActionState({ type: null, item: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Visitantes</h1>
                    <p className="text-muted-foreground">
                        Lista general de visitantes y seguimiento.
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Visitante
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 md:w-[300px]"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch id="assigned-mode" checked={assignedToMe} onCheckedChange={setAssignedToMe} />
                    <Label htmlFor="assigned-mode">Mis Seguimientos</Label>
                </div>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="VISITOR,PROSPECT">Activos</SelectItem>
                        <SelectItem value="VISITOR">Solo Visitantes</SelectItem>
                        <SelectItem value="PROSPECT">Solo Prospectos</SelectItem>
                        <SelectItem value="ARCHIVED">Archivados</SelectItem>
                        <SelectItem value="ALL">Todos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">{error}</div>}

            <FollowUpsList
                data={data}
                loading={loading}
                onAction={handleAction}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between py-4 border-t">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mostrar</span>
                    <Select
                        value={limit.toString()}
                        onValueChange={(val) => {
                            setLimit(Number(val));
                            setPage(1); // Reset to first page on limit change
                        }}
                    >
                        <SelectTrigger className="w-[70px] h-8">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="15">15</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">por página</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-4">
                        Página {meta?.page || 1} de {meta?.totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!meta || meta.page <= 1 || loading}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!meta || meta.page >= (meta?.totalPages || 1) || loading}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>

            {/* Dialogs */}
            <FollowUpCreateDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => {
                    setIsCreateOpen(false);
                    refetch();
                }}
            />

            {editingItem && (
                <FollowUpEditDialog
                    followup={editingItem}
                    open={!!editingItem}
                    onOpenChange={(open) => !open && setEditingItem(null)}
                    onSuccess={() => {
                        setEditingItem(null);
                        refetch();
                    }}
                />
            )}

            {assigningItem && (
                <AssignMemberDialog
                    followUpId={assigningItem.id}
                    currentAssignedId={assigningItem.assignedMemberId}
                    followUpName={`${assigningItem.firstName} ${assigningItem.lastName}`}
                    open={!!assigningItem}
                    onOpenChange={(open) => !open && setAssigningItem(null)}
                    onSuccess={() => {
                        setAssigningItem(null);
                        refetch();
                    }}
                />
            )}

            <AlertDialog open={!!actionState.type} onOpenChange={(open) => !open && setActionState({ type: null, item: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionState.type === 'DELETE' && 'Esta acción no se puede deshacer. Se eliminará permanentemente.'}
                            {actionState.type === 'ARCHIVE' && 'Se moverá a los archivos. Puede restaurarlo luego.'}
                            {actionState.type === 'PROMOTE' && 'Se convertirá en Miembro activo de la iglesia.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmAction}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
