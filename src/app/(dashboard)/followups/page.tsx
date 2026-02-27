"use client";

import { useState } from 'react';
import { useFollowUps, FollowUpPerson } from '@/hooks/useFollowUps';
import { FollowUpsList } from '@/components/FollowUp/FollowUpsList';
import { FollowUpCreateDialog } from '@/components/FollowUp/FollowUpCreateDialog';
import { FollowUpEditDialog } from '@/components/FollowUp/FollowUpEditDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function FollowUpsPage() {
    const { user } = useAuth();
    const [status, setStatus] = useState<string>('VISITOR,PROSPECT');
    const [search, setSearch] = useState('');
    const { data, loading, error, refetch } = useFollowUps({ status, search });

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FollowUpPerson | null>(null);
    const [actionState, setActionState] = useState<{ type: 'DELETE' | 'ARCHIVE' | 'PROMOTE' | 'ASSIGN' | null, item: FollowUpPerson | null }>({ type: null, item: null });

    const canManage = user?.roles?.includes(FunctionalRole.ADMIN_CHURCH) ||
        user?.roles?.includes(FunctionalRole.AUDITOR) ||
        user?.systemRole === SystemRole.ADMIN_APP;

    const handleAction = (type: 'EDIT' | 'ARCHIVE' | 'PROMOTE' | 'DELETE' | 'ASSIGN', item: FollowUpPerson) => {
        if (type === 'EDIT') {
            setEditingItem(item);
        } else {
            setActionState({ type, item });
        }
    };

    const confirmAction = async () => {
        if (!actionState.item || !actionState.type) return;

        try {
            if (actionState.type === 'DELETE') {
                // Hard Delete
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
                    <h1 className="text-3xl font-bold tracking-tight">Seguimientos</h1>
                    <p className="text-muted-foreground">
                        Gestión de visitantes y prospectos de la iglesia.
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Ingreso
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
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="VISITOR,PROSPECT">Activos (Visitantes/Prospectos)</SelectItem>
                        <SelectItem value="VISITOR">Solo Visitantes</SelectItem>
                        <SelectItem value="PROSPECT">Solo Prospectos</SelectItem>
                        <SelectItem value="MEMBER">Miembros</SelectItem>
                        <SelectItem value="ARCHIVED">Archivados</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">{error}</div>}

            <FollowUpsList
                data={data}
                loading={loading}
                onAction={handleAction}
            />

            {/* Dialogs */}
            <FollowUpCreateDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={refetch}
            />

            <FollowUpEditDialog
                open={!!editingItem}
                onOpenChange={(open) => !open && setEditingItem(null)}
                followup={editingItem}
                onSuccess={refetch}
            />

            <AlertDialog open={!!actionState.type} onOpenChange={(open) => !open && setActionState({ type: null, item: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionState.type === 'DELETE' && '¿Eliminar Definitivamente?'}
                            {actionState.type === 'ARCHIVE' && '¿Archivar Seguimiento?'}
                            {actionState.type === 'PROMOTE' && '¿Promover a Miembro?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionState.type === 'DELETE' && 'Esta acción no se puede deshacer. Se eliminará el registro y sus notas.'}
                            {actionState.type === 'ARCHIVE' && 'El seguimiento se moverá a la lista de archivados.'}
                            {actionState.type === 'PROMOTE' && `¿Confirma que ${actionState.item?.firstName} ahora es miembro oficial?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAction}
                            className={actionState.type === 'DELETE' ? 'bg-destructive hover:bg-destructive/90' : ''}
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
