'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Users, ArrowLeft, Loader2, CheckCircle, Plus, Clock, MapPin, Trash2, AlertCircle, FileText, Target, Map } from 'lucide-react';
import { SmallGroup, SmallGroupMember } from '@/types/small-group';
import { CalendarEvent, CalendarEventType } from '@/types/agenda';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { TakeAttendanceDialog } from '../take-attendance-dialog';
import { CreateEventDialog } from '../../agenda/create-event-dialog';
import { AddMemberDialog } from '../add-member-dialog';
import { GroupAttendanceDialog } from '../group-attendance-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/Separator';

export default function GroupDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [group, setGroup] = useState<SmallGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog States
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    const fetchGroup = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Grupo no encontrado');
            const data = await res.json();
            setGroup(data);
        } catch (error) {
            toast.error('Error al cargar el grupo');
            router.push('/groups');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [params.id, router]);

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        setIsRemoving(true);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${params.id}/members/${memberToRemove}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error al quitar miembro');

            toast.success('Miembro eliminado del grupo');
            fetchGroup();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo quitar al miembro');
        } finally {
            setIsRemoving(false);
            setMemberToRemove(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }
    if (!group) return null;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full mt-1">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{group.name}</h1>
                            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                                {group.members?.length || 0} Miembros
                            </Badge>
                        </div>
                        <p className="text-slate-500 mt-1 text-lg">{group.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">

                    <Button onClick={() => setIsAddMemberOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Miembro
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-slate-100/80 p-1 rounded-lg">
                    <TabsTrigger value="overview" className="px-6">Vision General</TabsTrigger>
                    <TabsTrigger value="members" className="px-6">Miembros</TabsTrigger>
                    <TabsTrigger value="calendar" className="px-6">Calendario y Asistencia</TabsTrigger>
                </TabsList>

                {/* --- TAB: OVERVIEW --- */}
                <TabsContent value="overview" className="mt-6 space-y-6 animate-in fade-in-50 duration-500">
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Info Cards */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Objetivo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-800 font-medium leading-relaxed">
                                    {group.objective || 'Sin objetivo definido'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Horario
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{group.meetingDay || 'A confirmar'}</div>
                                <p className="text-slate-500">{group.meetingTime ? `${group.meetingTime} hs` : ''}</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Map className="w-4 h-4" /> Ubicación
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-800 font-medium">
                                    {group.address || 'Rotativa / A confirmar'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Material de Estudio</h3>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{group.studyMaterial || 'Sin material asignado'}</h4>
                                    <p className="text-sm text-slate-500 mt-1">Tema actual: <span className="text-slate-700 font-medium">{group.currentTopic || '-'}</span></p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="bg-gradient-to-br from-violet-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg flex flex-col justify-between transition-all"
                            style={(() => {
                                const nextEvent = group.events
                                    ?.filter(e => isFuture(new Date(e.startDate)) || isToday(new Date(e.startDate)))
                                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

                                if (nextEvent?.color) {
                                    return {
                                        backgroundImage: `linear-gradient(to bottom right, ${nextEvent.color}, ${nextEvent.color}dd)`,
                                        border: `1px solid ${nextEvent.color}`
                                    };
                                }
                                return {};
                            })()}
                        >
                            <div>
                                <h3 className="text-white/80 font-medium mb-2">Próxima Reunión</h3>
                                {(() => {
                                    const nextEvent = group.events
                                        ?.filter(e => isFuture(new Date(e.startDate)) || isToday(new Date(e.startDate)))
                                        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

                                    if (!nextEvent) return <p className="text-2xl font-bold">Sin agendar</p>;

                                    return (
                                        <>
                                            <div className="text-3xl font-bold mb-1">{nextEvent.title}</div>
                                            <div className="flex items-center gap-2 text-white/90">
                                                <Clock className="w-4 h-4" />
                                                {format(new Date(nextEvent.startDate), "EEEE d 'de' MMMM", { locale: es })} - {format(new Date(nextEvent.startDate), 'H:mm')} hs
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            <Button variant="secondary" size="sm" className="self-start mt-4 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                                onClick={() => {
                                    const tabTrigger = document.querySelector('[data-value="calendar"]') as HTMLElement;
                                    if (tabTrigger) tabTrigger.click();
                                }}
                            >
                                Ver Calendario
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* --- TAB: MEMBERS --- */}
                <TabsContent value="members" className="mt-6 animate-in fade-in-50 duration-500">
                    {(() => {
                        const pastEvents = group.events?.filter(e => new Date(e.startDate) < new Date()) || [];
                        const totalEvents = pastEvents.length;

                        return (
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle className="text-lg font-semibold text-slate-800">Listado de Miembros</CardTitle>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Clock className="w-4 h-4" />
                                            <span>Reuniones realizadas: <strong className="text-slate-900">{totalEvents}</strong></span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-white">{group.members?.length} Total</Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {group.members?.map((member) => {
                                            const personId = member.member.person?.id;
                                            const attendedCount = personId
                                                ? pastEvents.filter(ev => (ev.attendees || []).some((att: any) => att.id === personId)).length
                                                : 0;
                                            const percentage = totalEvents > 0 ? (attendedCount / totalEvents) * 100 : 0;

                                            // Determine color
                                            let colorClass = 'bg-rose-500';
                                            if (percentage >= 80) colorClass = 'bg-emerald-500';
                                            else if (percentage >= 50) colorClass = 'bg-amber-400';

                                            return (
                                                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg border-2 border-white shadow-sm ring-2 ring-slate-50 relative overflow-hidden">
                                                                {(member.member.person?.firstName || '?').charAt(0)}{(member.member.person?.lastName || '?').charAt(0)}
                                                            </div>
                                                            {member.role === 'MODERATOR' && (
                                                                <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white p-1 rounded-full shadow-sm border border-white" title="Líder">
                                                                    <Target className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <h4 className="font-semibold text-slate-900 text-base">
                                                                {member.member.person?.firstName} {member.member.person?.lastName}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Badge variant={member.role === 'MODERATOR' ? 'default' : 'secondary'} className={`text-[10px] px-1.5 h-5 ${member.role === 'MODERATOR' ? 'bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200' : 'bg-slate-100 text-slate-600'}`}>
                                                                    {member.role === 'MODERATOR' ? 'LÍDER' : 'PARTICIPANTE'}
                                                                </Badge>
                                                                <span className="text-xs text-slate-400">{member.member.ecclesiasticalRole || 'Miembro'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 md:gap-8">
                                                        {/* Attendance Stats Section */}
                                                        <div className="text-right flex flex-col items-end min-w-[80px]">
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Asistencia</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-bold text-slate-700">
                                                                    {attendedCount} <span className="text-slate-300">/</span> {totalEvents}
                                                                </span>
                                                                <div className="w-2 h-8 bg-slate-100 rounded-full relative overflow-hidden" title={`${Math.round(percentage)}%`}>
                                                                    <div
                                                                        className={`absolute bottom-0 w-full transition-all duration-500 ${colorClass}`}
                                                                        style={{ height: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                            onClick={() => setMemberToRemove(member.member.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })()}
                </TabsContent>

                {/* --- TAB: CALENDAR --- */}
                <TabsContent value="calendar" className="mt-6 animate-in fade-in-50 duration-500 space-y-8">

                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">Agenda de Reuniones</h3>
                        <CreateEventDialog
                            onEventCreated={fetchGroup}
                            defaultType={CalendarEventType.SMALL_GROUP}
                            defaultEntityId={group.id}
                            trigger={<Button><Plus className="w-4 h-4 mr-2" /> Agendar Reunión</Button>}
                        />
                    </div>

                    {/* Upcoming Events */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Próximas</h4>
                        {(() => {
                            const futureEvents = group.events?.filter(e => isFuture(new Date(e.startDate)) || isToday(new Date(e.startDate))) || [];
                            if (futureEvents.length === 0) return <p className="text-slate-400 italic text-sm">No hay reuniones futuras programadas.</p>;

                            return futureEvents.map(event => (
                                <MeetingCard
                                    key={event.id}
                                    event={event}
                                    members={group.members || []}
                                    onAttendanceUpdated={fetchGroup}
                                    isPast={false}
                                />
                            ));
                        })()}
                    </div>

                    <Separator />

                    {/* Past Events */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Historial</h4>
                        {(() => {
                            const pastEvents = group.events?.filter(e => isPast(new Date(e.startDate)) && !isToday(new Date(e.startDate))).reverse() || [];
                            if (pastEvents.length === 0) return <p className="text-slate-400 italic text-sm">No hay reuniones pasadas.</p>;

                            return pastEvents.map(event => (
                                <MeetingCard
                                    key={event.id}
                                    event={event}
                                    members={group.members || []}
                                    onAttendanceUpdated={fetchGroup}
                                    isPast={true}
                                />
                            ));
                        })()}
                    </div>

                </TabsContent>
            </Tabs>

            {/* --- DIALOGS --- */}
            <AddMemberDialog
                open={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
                groupId={group.id}
                existingMemberIds={group.members?.map(m => m.member.id) || []}
                onMemberAdded={fetchGroup}
            />



            <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" /> Confirmar eliminación
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas quitar a este miembro del grupo?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={(e) => { e.preventDefault(); handleRemoveMember(); }}
                            disabled={isRemoving}
                        >
                            {isRemoving ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Sub-component for Meeting Card
function MeetingCard({ event, members, onAttendanceUpdated, isPast }: { event: CalendarEvent, members: SmallGroupMember[], onAttendanceUpdated: () => void, isPast: boolean }) {
    return (
        <div
            className={`
                p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all
                ${isPast ? 'bg-slate-50/30' : 'bg-white hover:border-slate-200 hover:shadow-md'}
            `}
            style={{ borderLeft: `5px solid ${event.color || '#6366f1'}${isPast ? '80' : ''}` }}
        >
            <div className="flex items-center gap-4">
                <div
                    className={`p-3 rounded-lg text-center min-w-[60px] ${isPast ? 'bg-slate-100/50 text-slate-400' : 'bg-slate-50 text-indigo-600'}`}
                    style={event.color ? { backgroundColor: `${event.color}${isPast ? '10' : '15'}`, color: event.color } : {}}
                >
                    <div className="text-xs font-bold uppercase">{format(new Date(event.startDate), 'MMM', { locale: es })}</div>
                    <div className="text-xl font-bold">{format(new Date(event.startDate), 'd')}</div>
                </div>
                <div>
                    <h4 className={`font-semibold ${isPast ? 'text-slate-600' : 'text-slate-900'}`}>{event.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {format(new Date(event.startDate), 'HH:mm')}</span>
                        {event.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>}
                        {/* Attendance Count Badge if > 0 */}
                        {event.attendees && event.attendees.length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                                {event.attendees.length} Asistentes
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
                <AttendanceButton event={event} members={members} onAttendanceUpdated={onAttendanceUpdated} />
            </div>
        </div>
    );
}

function AttendanceButton({ event, members, onAttendanceUpdated }: { event: CalendarEvent, members: SmallGroupMember[], onAttendanceUpdated: () => void }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="bg-white hover:bg-slate-50">
                <CheckCircle className="w-4 h-4 mr-2 text-slate-500" />
                Asistencia
            </Button>
            <TakeAttendanceDialog
                open={open}
                onOpenChange={setOpen}
                event={event}
                members={members}
                onSuccess={() => {
                    toast.success('Asistencia actualizada');
                    onAttendanceUpdated();
                }}
            />
        </>
    );
}
