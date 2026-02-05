'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import api from '@/lib/api';

import ParticipantList from '@/components/shared/participants/ParticipantList';
import AddMemberDialog from '@/components/shared/participants/AddMemberDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Replaces components/courses/ParticipantList.tsx
// Adapts it to use Shared Component

export default function ProgramParticipantList({ course, refresh }: any) {
    const { user } = useAuth();
    const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
    const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: string } | null>(null);

    const [editingGuest, setEditingGuest] = useState<any>(null);
    const { register, handleSubmit, reset } = useForm();
    const isAdminOrAuditor = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';

    // Calculate Stats
    const now = new Date();
    const pastSessions = (course.sessions || []).filter((s: any) => new Date(s.date) < now);
    const totalEvents = pastSessions.length;

    // Use SessionAttendance (Source of Truth) instead of Event Attendees
    const getAttendedCount = (id: string, type: 'PARTICIPANT' | 'GUEST') => {
        if (!id) return 0;
        return pastSessions.filter((s: any) => {
            const record = s.attendances?.find((a: any) => {
                if (type === 'PARTICIPANT') return a.participant?.id === id;
                if (type === 'GUEST') return a.guest?.id === id;
                return false;
            });
            return record?.present === true;
        }).length;
    };

    // Map Data
    const members = (course.participants || []).map((p: any) => ({
        id: p.id,
        name: p.member.person?.fullName,
        avatarUrl: p.member.person?.profileImage,
        email: p.member.person?.email,
        type: 'MEMBER' as const,
        attendedCount: getAttendedCount(p.id, 'PARTICIPANT'), // Pass CourseParticipant ID
        totalEvents
    }));

    const visitors = (course.guests || []).filter((g: any) => g.followUpPerson).map((g: any) => ({
        id: g.id,
        name: g.fullName,
        email: g.email,
        phone: g.phone,
        type: 'VISITOR' as const,
        attendedCount: getAttendedCount(g.id, 'GUEST'), // Pass CourseGuest ID directly
        totalEvents
    }));

    const guests = (course.guests || []).filter((g: any) => !g.followUpPerson).map((g: any) => ({
        id: g.id,
        name: g.fullName,
        email: g.email,
        phone: g.phone,
        type: 'GUEST' as const,
        attendedCount: getAttendedCount(g.id, 'GUEST'), // Pass CourseGuest ID directly
        totalEvents
    }));

    const confirmRemove = (id: string, type: string) => {
        setDeleteTarget({ id, type });
        setAlertOpen(true);
    };

    const handleRemove = async () => {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.type === 'MEMBER') {
                await api.delete(`/courses/participants/${deleteTarget.id}`);
            } else {
                await api.delete(`/courses/guests/${deleteTarget.id}`);
            }
            toast.success('Eliminado correctamente');
            refresh();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Error al eliminar');
        } finally {
            setAlertOpen(false);
            setDeleteTarget(null);
        }
    };

    const onEditGuest = (guest: any) => {
        const original = course.guests?.find((g: any) => g.id === guest.id);
        if (original) {
            setEditingGuest(original);
            reset({
                firstName: original.fullName.split(' ')[0],
                lastName: original.fullName.split(' ').slice(1).join(' '),
                email: original.email,
                phone: original.phone,
                notes: original.notes
            });
            setIsGuestDialogOpen(true);
        }
    };

    const onSaveGuest = async (data: any) => {
        try {
            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                fullName: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phone: data.phone,
                notes: data.notes
            };
            await api.patch(`/courses/guests/${editingGuest.id}`, payload);
            toast.success('Actualizado correctamente');
            setIsGuestDialogOpen(false);
            refresh();
        } catch (e) { toast.error('Error al actualizar'); }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Personas</h3>
                    <p className="text-sm text-slate-500">Administra la asistencia y participación</p>
                </div>
                {isAdminOrAuditor && (
                    <Button onClick={() => setIsAddPeopleOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                        <UserPlus className="w-5 h-5 mr-2" /> Agregar Persona
                    </Button>
                )}
            </div>

            <ParticipantList
                members={members}
                visitors={visitors}
                guests={guests}
                canManage={isAdminOrAuditor}
                onRemove={(id, type) => confirmRemove(id, type as string)}
                onEditGuest={onEditGuest}
            />

            <AddMemberDialog
                open={isAddPeopleOpen}
                onOpenChange={setIsAddPeopleOpen}
                type="course"
                entityId={course.id}
                existingMemberIds={(course.participants || []).map((p: any) => p.member.id)}
                existingVisitorIds={(course.guests || []).map((g: any) => g.followUpPerson?.id).filter(Boolean)}
                existingGuestIds={(course.guests || []).map((g: any) => g.personInvited?.id).filter(Boolean)}
                onSuccess={refresh}
            />

            <Dialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Editar Invitado</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit(onSaveGuest)} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1"><Label>Nombre</Label><Input {...register('firstName')} /></div>
                            <div className="space-y-1"><Label>Apellido</Label><Input {...register('lastName')} /></div>
                        </div>
                        <div className="space-y-1"><Label>Email</Label><Input {...register('email')} /></div>
                        <div className="space-y-1"><Label>Teléfono</Label><Input {...register('phone')} /></div>
                        <div className="space-y-1"><Label>Notas</Label><Input {...register('notes')} /></div>
                        <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará a la persona del programa. No se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemove} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
