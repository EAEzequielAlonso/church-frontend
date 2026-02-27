import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { GroupType, CreateGroupDto, UpdateGroupDto, GroupDto } from '../types/group.types';
import { getGroupTypeConfig } from '../config/group-type.config';
import { useGroups } from '../hooks/useGroups';
import { useCreateGroup } from '../hooks/useCreateGroup';
import { useUpdateGroup } from '../hooks/useUpdateGroup';
import { useDeleteGroup } from '../hooks/useDeleteGroup';
import { useGroupMutations } from '../hooks/useGroupMutations';
import { GroupCard } from './GroupCard';
import { GroupForm } from './GroupForm';
import { useAuth } from '@/context/AuthContext';
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
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface GroupListProps {
    type: GroupType | 'ALL';
}

export function GroupList({ type }: GroupListProps) {
    const router = useRouter();
    const { user } = useAuth();
    // Si es "ALL", podemos forzar a que use la config de SMALL_GROUP o un genérico
    const config = getGroupTypeConfig(type === 'ALL' ? 'SMALL_GROUP' : type);

    const {
        groups,
        isLoading,
        refetch
    } = useGroups(type);

    const { createGroup } = useCreateGroup();
    const { updateGroup } = useUpdateGroup();
    const { deleteGroup } = useDeleteGroup();
    const { enroll, disenroll } = useGroupMutations();

    const isAdminOrAuditor = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';
    const currentMemberId = user?.memberId;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupDto | null>(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

    const handleCreateClick = () => {
        setEditingGroup(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (group: GroupDto) => {
        setEditingGroup(group);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (data: CreateGroupDto | UpdateGroupDto) => {
        if (editingGroup) {
            await updateGroup(editingGroup.id, data as UpdateGroupDto);
        } else {
            await createGroup(data as CreateGroupDto);
        }
        refetch();
        setIsDialogOpen(false);
    };

    const handleDeleteClick = (id: string) => {
        setGroupToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (groupToDelete) {
            await deleteGroup(groupToDelete);
            refetch();
        }
        setDeleteConfirmOpen(false);
        setGroupToDelete(null);
    };

    const handleJoin = async (groupId: string) => {
        if (currentMemberId) {
            await enroll(groupId, currentMemberId);
            refetch();
        }
    };

    const handleLeave = async (groupId: string) => {
        if (currentMemberId) {
            await disenroll(groupId, currentMemberId);
            refetch();
        }
    };

    const handleViewStart = (id: string) => {
        router.push(`/community/${id}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                        <config.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{config.labelPlural}</h2>
                        <p className="text-sm text-slate-500">
                            Gestión de {config.labelPlural.toLowerCase()} de la iglesia.
                        </p>
                    </div>
                </div>

                {isAdminOrAuditor && (
                    <Button
                        onClick={handleCreateClick}
                        className={`shadow-sm text-white ${config.color.replace('text-', 'bg-')} hover:opacity-90`}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {config.createButtonLabel}
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className={`w-8 h-8 animate-spin ${config.color}`} />
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${config.bgColor}`}>
                        <config.icon className={`w-8 h-8 ${config.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{config.emptyStateMessage}</h3>
                    <p className="text-slate-500 mt-1">{config.emptyStateDescription}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            isAdminOrAuditor={isAdminOrAuditor || false}
                            currentMemberId={currentMemberId}
                            onJoin={handleJoin}
                            onLeave={handleLeave}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            onViewStart={handleViewStart}
                        />
                    ))}
                </div>
            )}

            <GroupForm
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialType={type === 'ALL' ? 'SMALL_GROUP' : type}
                fixedType={type !== 'ALL'}
                editingGroup={editingGroup}
                onSubmit={handleSubmit}
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar este {config.label.toLowerCase()}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se perderán las inscripciones y registros de asistencia asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar Definitivamente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
