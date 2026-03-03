'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChevronLeft,
    Calendar,
    HeartHandshake,
    GraduationCap,
    UserPlus,
    Lock,
    Clock,
    CheckCircle2,
    MessageSquare,
    CheckSquare,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMentorshipDetail } from '../hooks/use-mentorship-detail';
import { MentorshipType, MentorshipStatus } from '../types/mentorship.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MentorshipCreateNoteDialog } from './MentorshipCreateNoteDialog';
import { MentorshipCreateTaskDialog } from './MentorshipCreateTaskDialog';
import { CreateEventDialog } from '@/app/(dashboard)/agenda/create-event-dialog';
import { CalendarEventType } from '@/types/agenda';
import { useCreateMeeting } from '../hooks/use-create-meeting';
import { useChurchPersons } from '@/features/groups/hooks/useChurchPersons';
import { ChurchPersonDto } from '@/features/groups/types/group.types';

export function MentorshipDetail({ id }: { id: string }) {
    const router = useRouter();
    const { user } = useAuth(); // Global user context
    const { persons = [] } = useChurchPersons();
    const { data, isLoading, isError } = useMentorshipDetail(id);
    const { createMeeting, isMutating: isCreatingMeeting } = useCreateMeeting();
    const [activeTab, setActiveTab] = useState('info');

    const handleCreateMeeting = async (meetingData: any) => {
        await createMeeting({
            mentorshipId: id,
            payload: {
                title: meetingData.title,
                description: meetingData.description,
                color: meetingData.color,
                location: meetingData.location,
                scheduledDate: meetingData.startDate,
                endDate: meetingData.endDate
            }
        });
    };

    const getPersonName = (id: string) => {
        const found = persons.find((p: ChurchPersonDto) => p.id === id);
        return found?.person?.fullName || 'Usuario Desconocido';
    };

    if (isLoading) {
        return (
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-pulse">
                <div className="h-8 w-32 bg-slate-200 rounded-md mb-8"></div>
                <div className="h-32 w-full bg-slate-100 rounded-2xl border border-slate-200"></div>
                <div className="h-10 w-64 bg-slate-200 rounded-md"></div>
                <div className="h-64 w-full bg-slate-50 rounded-2xl border border-slate-200"></div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex-1 p-4 md:p-8 pt-6">
                <Button variant="ghost" onClick={() => router.push('/mentorship')} className="mb-6 -ml-4 text-slate-500">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Volver al listado
                </Button>
                <div className="p-12 border rounded-2xl border-dashed border-red-200 bg-red-50 flex flex-col items-center text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Error al cargar el detalle</h3>
                    <p className="text-slate-500 mt-1">No se pudo encontrar el proceso o hubo un problema de conexión.</p>
                </div>
            </div>
        );
    }

    // Role-based logic filtering (Backend should also filter this, frontend projection helps UI logic)
    // As per prompt rule: if user.role === 'MENTEE', filter out private notes.
    // In our domain, we might check user role or we assume 'MENTEE' explicitly.
    const isMentee = (user as any)?.role === 'MENTEE';
    const visibleNotes = data.notes?.filter(note => isMentee ? note.type !== 'PERSONAL' && note.type !== 'SUPERVISION' : true) || [];

    const mentors = data.participants?.filter(p => p.role === 'MENTOR') || [];
    const mentees = data.participants?.filter(p => p.role === 'PARTICIPANT') || [];

    // UI Helpers
    const getTypeConfig = (t: MentorshipType) => {
        switch (t) {
            case 'DISCIPLESHIP': return { label: 'Discipulado', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200', icon: GraduationCap };
            case 'COUNSELING': return { label: 'Consejería', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', icon: HeartHandshake };
            case 'FOLLOW_UP': return { label: 'Seguimiento', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200', icon: UserPlus };
            default: return { label: 'Proceso', color: 'bg-slate-100 text-slate-700', icon: Calendar };
        }
    };

    const getStatusConfig = (s: MentorshipStatus) => {
        switch (s) {
            case 'ACTIVE': return { label: 'Activo', color: 'bg-green-100 text-green-800' };
            case 'PAUSED': return { label: 'Pausado', color: 'bg-amber-100 text-amber-800' };
            case 'CLOSED': return { label: 'Cerrado', color: 'bg-slate-100 text-slate-800' };
            default: return { label: s, color: 'bg-slate-100 text-slate-800' };
        }
    };

    const config = getTypeConfig(data.type);
    const statusConfig = getStatusConfig(data.status);
    const Icon = config.icon;

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-6xl mx-auto">
            <Button variant="ghost" onClick={() => router.push('/mentorship')} className="mb-2 -ml-4 text-slate-500 hover:text-slate-900">
                <ChevronLeft className="w-4 h-4 mr-2" /> Volver al listado
            </Button>

            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className={`font-semibold px-3 py-1 shadow-none ${config.color}`} variant="secondary">
                                <Icon className="w-4 h-4 mr-2" />
                                {config.label}
                            </Badge>
                            <Badge className={`font-bold px-3 py-1 shadow-none border-none ${statusConfig.color}`}>
                                {statusConfig.label}
                            </Badge>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Proceso con {mentees.length > 0 ? getPersonName(mentees[0].churchPersonId) : 'Persona Guiada'}
                        </h2>
                        <div className="flex items-center text-slate-500 mt-2 text-sm font-medium">
                            <Calendar className="w-4 h-4 mr-2" />
                            Iniciado el {format(new Date(data.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mentor Asignado</p>
                            <p className="font-bold text-slate-800 flex items-center">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs mr-2">M</span>
                                {mentors.length > 0 ? getPersonName(mentors[0].churchPersonId) : 'No asignado'}
                            </p>
                        </div>
                        <div className="hidden sm:block w-px bg-slate-200 mx-2"></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Aconsejado / Discípulo</p>
                            <p className="font-bold text-slate-800 flex items-center">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs mr-2">A</span>
                                {mentees.length > 0 ? getPersonName(mentees[0].churchPersonId) : 'Desconocido'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-auto inline-flex flex-wrap shadow-sm">
                    <TabsTrigger value="info" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        Información
                    </TabsTrigger>
                    <TabsTrigger value="meetings" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        Encuentros <Badge variant="secondary" className="ml-2 bg-slate-100/20 data-[state=active]:bg-white/20">{data.meetings?.length || 0}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        Notas <Badge variant="secondary" className="ml-2 bg-slate-100/20 data-[state=active]:bg-white/20">{visibleNotes.length}</Badge>
                    </TabsTrigger>
                    {data.mode === 'FORMAL' && (
                        <TabsTrigger value="tasks" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                            Tareas <Badge variant="secondary" className="ml-2 bg-slate-100/20 data-[state=active]:bg-white/20">{data.tasks?.length || 0}</Badge>
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* TAB: Información */}
                <TabsContent value="info" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Configuración del Proceso</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Mentoría</p>
                                <p className="font-bold text-slate-800">{config.label}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Modo / Rigurosidad</p>
                                <p className="font-bold text-slate-800">{data.mode === 'FORMAL' ? 'Formal (Estructurado)' : 'Informal (Flexible)'}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 md:col-span-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Participantes</p>
                                <div className="space-y-3">
                                    {data.participants?.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.role === 'MENTOR' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {p.role === 'MENTOR' ? 'M' : 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900">{getPersonName(p.churchPersonId)}</p>
                                                    <p className="text-xs text-slate-500">{p.role === 'MENTOR' ? 'Mentor asignado' : 'Persona guiada'}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={p.status === 'PENDING' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-green-200 text-green-700 bg-green-50'}>
                                                {p.status === 'PENDING' ? 'Pendiente' : 'Activo'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: Encuentros */}
                <TabsContent value="meetings" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Encuentros y Reuniones</h3>
                        <CreateEventDialog
                            onEventCreated={() => { }}
                            onSubmitOverride={handleCreateMeeting}
                            defaultType={CalendarEventType.PERSONAL}
                            trigger={
                                <Button variant="outline" className="font-semibold" size="sm" disabled={isCreatingMeeting}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Programar Encuentro
                                </Button>
                            }
                        />
                    </div>
                    <div className="space-y-4">
                        {!data.meetings || data.meetings.length === 0 ? (
                            <div className="p-12 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                                <Clock className="w-10 h-10 text-slate-300 mb-4" />
                                <h4 className="text-lg font-bold text-slate-900">Sin encuentros aún</h4>
                                <p className="text-slate-500 mt-1 max-w-sm">No se han registrado reuniones programadas o pasadas en este proceso.</p>
                            </div>
                        ) : (
                            data.meetings.map(meeting => (
                                <div key={meeting.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meeting.isCompleted ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`} style={{ backgroundColor: meeting.color ? `${meeting.color}20` : undefined, color: meeting.color }}>
                                            {meeting.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">
                                                {meeting.title || "Encuentro Programado"}
                                                <span className="text-sm font-normal text-slate-500 ml-2">
                                                    | {format(new Date(meeting.scheduledDate), "EEEE, d 'de' MMMM yyyy, HH:mm", { locale: es })}
                                                </span>
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-0.5">{meeting.location || 'Ubicación no especificada'}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={meeting.isCompleted ? "border-green-200 text-green-700 bg-green-50" : "border-amber-200 text-amber-700 bg-amber-50"}>
                                        {meeting.isCompleted ? 'Completado' : 'Pendiente'}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* TAB: Notas */}
                <TabsContent value="notes" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Historial de Notas</h3>
                        <MentorshipCreateNoteDialog mentorshipId={id} isMentee={isMentee} />
                    </div>
                    <div className="space-y-4">
                        {visibleNotes.length === 0 ? (
                            <div className="p-12 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                                <MessageSquare className="w-10 h-10 text-slate-300 mb-4" />
                                <h4 className="text-lg font-bold text-slate-900">Sin notas registradas</h4>
                                <p className="text-slate-500 mt-1 max-w-sm">
                                    {isMentee ? "No hay notas visibles para ti en este proceso." : "No se han añadido observaciones o notas a este acompañamiento."}
                                </p>
                            </div>
                        ) : (
                            visibleNotes.map(note => (
                                <div key={note.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {note.authorChurchPersonId ? getPersonName(note.authorChurchPersonId).substring(0, 2).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{getPersonName(note.authorChurchPersonId)}</p>
                                                <p className="text-xs text-slate-500">{format(new Date(note.createdAt), "dd/MM/yyyy HH:mm")}</p>
                                            </div>
                                        </div>
                                        {note.type !== 'SHARED' && (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none shadow-none font-semibold">
                                                <Lock className="w-3 h-3 mr-1.5" />
                                                {note.type === 'PERSONAL' ? 'Privada' : 'Supervisión'}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* TAB: Tareas */}
                {data.mode === 'FORMAL' && (
                    <TabsContent value="tasks" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Tareas Asignadas</h3>
                            <MentorshipCreateTaskDialog
                                mentorshipId={id}
                                participants={data.participants || []}
                                getPersonName={getPersonName}
                            />
                        </div>
                        <div className="space-y-4">
                            {!data.tasks || data.tasks.length === 0 ? (
                                <div className="p-12 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                                    <CheckSquare className="w-10 h-10 text-slate-300 mb-4" />
                                    <h4 className="text-lg font-bold text-slate-900">Sin tareas asignadas</h4>
                                    <p className="text-slate-500 mt-1 max-w-sm">
                                        Asigna lecturas, actividades o metas a los participantes del proceso.
                                    </p>
                                </div>
                            ) : (
                                data.tasks.map(task => (
                                    <div key={task.id} className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${task.isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <CheckSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${task.isCompleted ? 'text-green-900 line-through opacity-70' : 'text-slate-900'}`}>{task.title}</h4>
                                                {task.description && (
                                                    <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-3">
                                                    {task.dueDate && (
                                                        <Badge variant="outline" className="text-xs font-medium text-slate-500 bg-white">
                                                            📅 {format(new Date(task.dueDate), "d 'de' MMM", { locale: es })}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-none">
                                                        👤 {task.assignedChurchPersonId ? getPersonName(task.assignedChurchPersonId) : 'Grupal'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
