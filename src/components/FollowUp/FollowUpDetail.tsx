import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FollowUpDetail as FollowUpDetailType } from '@/hooks/useFollowUpDetail';
import { useFollowUpNotes } from '@/hooks/useFollowUpNotes';
import { FollowUpNoteDialog, FollowUpNoteType } from './FollowUpNoteDialog';
import { FollowUpNotes } from './FollowUpNotes';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SystemRole, FunctionalRole } from '@/types/auth-types';
import { User, Mail, Phone, Calendar, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface FollowUpDetailProps {
    detail: FollowUpDetailType;
}

export function FollowUpDetail({ detail }: FollowUpDetailProps) {
    const { user } = useAuth();
    const { notes, loading: notesLoading, addNote, updateNote, deleteNote, refetch } = useFollowUpNotes(detail.id);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [selectedNote, setSelectedNote] = useState<any>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

    // Permission logic
    const isAssigned = detail.assignedMemberId === user?.memberId;
    const isAdminOrAuditor = user?.roles?.includes(FunctionalRole.ADMIN_CHURCH) ||
        user?.roles?.includes(FunctionalRole.AUDITOR) ||
        user?.systemRole === SystemRole.ADMIN_APP;

    const canAddNote = isAssigned || isAdminOrAuditor;

    // Status Label Mapping
    const getStatusLabel = (status: string) => {
        if (status === 'PROSPECT') return 'Candidato a Miembro';
        if (status === 'VISITOR') return 'Visitante';
        if (status === 'MEMBER') return 'Miembro';
        if (status === 'ARCHIVED') return 'Archivado';
        return status;
    };

    const handleAddClick = () => {
        setDialogMode('create');
        setSelectedNote(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (note: any) => {
        setDialogMode('edit');
        setSelectedNote(note);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (noteId: string) => {
        setNoteToDelete(noteId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (noteToDelete) {
            await deleteNote(noteToDelete);
            setDeleteDialogOpen(false);
            setNoteToDelete(null);
        }
    };

    const handleDialogSubmit = async (data: { text: string; type: FollowUpNoteType }) => {
        if (dialogMode === 'create') {
            await addNote(data);
        } else if (dialogMode === 'edit' && selectedNote) {
            await updateNote(selectedNote.id, data);
        }
    };

    return (
        <div className="space-y-6">
            {/* Full Width Visitor Info Card */}
            {/* Visitor Info Card - Compacted */}
            <Card className="w-full">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-semibold">Detalle del Seguimiento</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(detail.createdAt), "d MMMM yyyy", { locale: es })}
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-none">{detail.firstName} {detail.lastName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={(detail.status === 'VISITOR' || detail.status === 'PROSPECT') ? 'default' : 'secondary'} className="h-5 text-[10px] px-1.5">
                                        {getStatusLabel(detail.status)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info - Inline */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{detail.email || 'Sin email'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                <span>{detail.phone || 'Sin teléfono'}</span>
                            </div>
                        </div>

                        {/* Assigned To - Compact */}
                        <div className="flex items-center gap-2 text-sm border-l pl-4 min-w-[200px]">
                            <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Responsable</p>
                                <p className="font-medium text-xs">
                                    {detail.assignedMember?.person
                                        ? `${detail.assignedMember.person.firstName} ${detail.assignedMember.person.lastName} `
                                        : 'Sin asignar'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Full Width Notes Section */}
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">Bitácora</CardTitle>
                        <CardDescription className="text-xs">Notas y observaciones del proceso.</CardDescription>
                    </div>
                    {canAddNote && (
                        <Button size="sm" onClick={handleAddClick} className="h-8 gap-2">
                            <Plus className="h-3.5 w-3.5" />
                            Nueva Nota
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Tabs for Note Types */}
                    <FollowUpNotes
                        notes={notes}
                        loading={notesLoading}
                        isAdmin={isAdminOrAuditor}
                        isAssigned={isAssigned}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                </CardContent>
            </Card>

            <FollowUpNoteDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleDialogSubmit}
                isAdmin={isAdminOrAuditor}
                isAssigned={isAssigned}
                mode={dialogMode}
                initialData={selectedNote ? { text: selectedNote.text, type: selectedNote.type } : undefined}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la nota.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
