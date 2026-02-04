'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Search, User, Mail, Phone, Trash2, UserCheck, Plus, Users, Edit2, Settings, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import AddPeopleDialog from './AddPeopleDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ParticipantList({ course, refresh }: any) {
    const { user } = useAuth();
    const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
    // Separate dialog for editing existing guests
    const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

    const isAdminOrAuditor = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';
    const { register, handleSubmit, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [enrollError, setEnrollError] = useState<string | null>(null);

    const onAddPeopleSuccess = () => {
        refresh();
        // Keep open? User might want to add more.
        // For now let's keep it open unless they close it.
    };

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, id: string | null, type: 'MEMBER' | 'GUEST' | null }>({
        open: false, id: null, type: null
    });

    const handleDeleteParticipant = (participantId: string) => {
        setDeleteConfirm({ open: true, id: participantId, type: 'MEMBER' });
    };

    const handleDeleteGuest = (guestId: string) => {
        setDeleteConfirm({ open: true, id: guestId, type: 'GUEST' });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            if (deleteConfirm.type === 'MEMBER') {
                await api.delete(`/courses/participants/${deleteConfirm.id}`);
                toast.success('Participante eliminado');
            } else {
                await api.delete(`/courses/guests/${deleteConfirm.id}`);
                toast.success('Invitado eliminado');
            }
            refresh();
        } catch (e) {
            toast.error('Error al eliminar');
        } finally {
            setDeleteConfirm({ open: false, id: null, type: null });
        }
    };

    const [editingGuest, setEditingGuest] = useState<any>(null);

    const onAddGuest = async (data: any) => {
        setIsLoading(true);
        try {
            const fullName = `${data.firstName} ${data.lastName}`.trim();
            const payload = {
                ...data,
                fullName,
                email: data.email || undefined,
                phone: data.phone || undefined,
                notes: data.notes || undefined
            };

            if (editingGuest) {
                await api.patch(`/courses/guests/${editingGuest.id}`, payload);
                toast.success('Invitado actualizado');
            } else {
                await api.post(`/courses/${course.id}/guests`, payload);
                toast.success('Invitado registrado');
            }

            setIsGuestDialogOpen(false);
            setEditingGuest(null);
            reset();
            refresh();
        } catch (error: any) {
            const data = error.response?.data;
            let finalMsg = 'Error al procesar invitado';

            if (data?.message) {
                finalMsg = Array.isArray(data.message) ? data.message[0] : data.message;
            }

            setEnrollError(finalMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditGuest = (guest: any) => {
        // Assume guest has fullName which we split for the form
        const names = guest.fullName.split(' ');
        setEditingGuest(guest);
        reset({
            firstName: names[0],
            lastName: names.slice(1).join(' '),
            email: guest.email,
            phone: guest.phone,
            notes: guest.notes
        });
        setIsGuestDialogOpen(true);
    };



    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        api.get(`/courses/${course.id}/stats`).then(res => setStats(res.data)).catch(console.error);
    }, [course.id]);

    const isActivity = course.type === 'ACTIVITY';

    // Derived lists
    const members = course.participants || [];
    const visitors = (course.guests || []).filter((g: any) => g.followUpPerson); // Linked
    const guests = (course.guests || []).filter((g: any) => !g.followUpPerson); // Unlinked (New Guests)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Personas</h3>
                    <p className="text-sm text-slate-500">Administra la asistencia y participación</p>
                </div>
                {isAdminOrAuditor && (
                    <Button onClick={() => setIsAddPeopleOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-105 active:scale-95">
                        <UserPlus className="w-5 h-5 mr-2" /> Agregar Persona
                    </Button>
                )}
            </div>

            <Tabs defaultValue="members" className="w-full">
                <TabsList className="mb-6 grid grid-cols-3 h-12 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="members" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg py-2 transition-all">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Miembros <span className="ml-2 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">{members.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="visitors" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg py-2 transition-all">
                        <User className="w-4 h-4 mr-2" />
                        Visitantes <span className="ml-2 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">{visitors.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="guests" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg py-2 transition-all">
                        <Users className="w-4 h-4 mr-2" />
                        Invitados <span className="ml-2 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">{guests.length}</span>
                    </TabsTrigger>
                </TabsList>

                {/* --- MEMBERS TAB --- */}
                <TabsContent value="members" className="space-y-4">
                    {members.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No hay miembros inscritos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {members.map((p: any) => (
                                <div key={p.id} className="flex items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm group hover:border-indigo-200 hover:shadow-md transition-all">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm mr-3">
                                        <AvatarImage src={p.member.person?.profileImage} />
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{p.member.person?.firstName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{p.member.person?.fullName}</p>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isAdminOrAuditor && (
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 p-2 h-auto rounded-full" onClick={() => handleDeleteParticipant(p.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* --- VISITORS TAB (Linked Guests) --- */}
                <TabsContent value="visitors" className="space-y-4">
                    {visitors.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No hay visitantes registrados en esta actividad.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {visitors.map((g: any) => (
                                <div key={g.id} className="p-3 bg-white border border-indigo-100 rounded-lg shadow-sm relative group hover:border-indigo-300 hover:shadow-md transition-all">
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        {isAdminOrAuditor && (
                                            <>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleEditGuest(g)}>
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteGuest(g.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold relative bg-indigo-100 text-indigo-600">
                                            {g.fullName?.[0]}

                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <p className="font-bold text-slate-800 text-sm truncate">{g.fullName}</p>
                                            <div className="flex flex-col gap-0.5 mt-1">

                                                {g.phone && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {g.phone}</span>}
                                                {g.email && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {g.email}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* --- GUESTS TAB (Unlinked) --- */}
                <TabsContent value="guests" className="space-y-4">
                    {guests.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No hay invitados nuevos (sin registro anterior).</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {guests.map((g: any) => (
                                <div key={g.id} className="p-3 bg-white border border-orange-100 rounded-lg shadow-sm relative group hover:border-orange-300 hover:shadow-md transition-all">
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        {isAdminOrAuditor && (
                                            <>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleEditGuest(g)}>
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteGuest(g.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-orange-100 text-orange-600">
                                            {g.fullName?.[0]}
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <p className="font-bold text-slate-800 text-sm truncate">{g.fullName}</p>
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                {g.phone && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {g.phone}</span>}
                                                {g.email && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {g.email}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* NEW UNIFIED DIALOG */}
            <AddPeopleDialog
                open={isAddPeopleOpen}
                onOpenChange={setIsAddPeopleOpen}
                courseId={course.id}
                existingMemberIds={(course.participants || []).map((p: any) => p.member.id)}
                existingVisitorIds={(course.guests || []).map((g: any) => g.followUpPerson?.id).filter(Boolean)}
                existingGuestIds={(course.guests || []).map((g: any) => g.personInvited?.id).filter(Boolean)}
                onSuccess={onAddPeopleSuccess}
            />

            {/* EDIT GUEST DIALOG (Legacy, kept for editing) */}
            <Dialog open={isGuestDialogOpen} onOpenChange={(open) => {
                setIsGuestDialogOpen(open);
                setEnrollError(null);
                if (!open) setEditingGuest(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingGuest ? 'Editar Invitado' : 'Registrar Invitado'}</DialogTitle>
                        <DialogDescription>Datos de contacto para seguimiento.</DialogDescription>
                    </DialogHeader>
                    {enrollError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm font-bold animate-pulse mb-2">
                            ⚠️ {enrollError}
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onAddGuest, (errors) => console.log(errors))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input {...register('firstName', { required: true })} placeholder="Ej: Juan" />
                            </div>
                            <div className="space-y-2">
                                <Label>Apellido</Label>
                                <Input {...register('lastName', { required: true })} placeholder="Ej: Pérez" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input {...register('phone')} placeholder="+54..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input {...register('email')} placeholder="juan@gmail.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notas</Label>
                            <Input {...register('notes')} placeholder="Referido por..." />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {editingGuest ? 'Guardar Cambios' : 'Registrar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* CONFIRM DELETE DIALOG */}
            <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Estás seguro?</DialogTitle>
                        <DialogDescription>
                            Esta acción eliminará al {deleteConfirm.type === 'MEMBER' ? 'miembro' : 'invitado'} del curso y de todos los eventos de agenda asociados.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, id: null, type: null })}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
