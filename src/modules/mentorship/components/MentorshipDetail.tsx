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
    AlertCircle,
    Activity,
    ClipboardCheck,
    Send,
    MessageSquareQuote,
    Users,
    User,
    ArrowRightCircle,
    CheckCircle,
    ChevronRight,
    Edit,
    Trash2,
    CheckSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mentorshipService } from '../services/mentorship.service';
import { useMentorshipDetail } from '../hooks/use-mentorship-detail';
import { MentorshipType, MentorshipStatus } from '../types/mentorship.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MentorshipCreateNoteDialog } from './MentorshipCreateNoteDialog';
import { MentorshipCreateTaskDialog } from './MentorshipCreateTaskDialog';
import { MentorshipEditTaskDialog } from './MentorshipEditTaskDialog';
import { MentorshipTaskViewDialog } from './MentorshipTaskViewDialog';
import { CreateEventDialog } from '@/app/(dashboard)/agenda/create-event-dialog';
import { UniversalMeetingCard } from '@/components/shared/UniversalMeetingCard';
import { CalendarEventType, EVENT_TYPE_COLORS } from '@/types/agenda';
import { useCreateMeeting } from '../hooks/use-create-meeting';
import { useChurchPersons } from '@/features/groups/hooks/useChurchPersons';
import { useDeleteTask } from '../hooks/use-delete-task';
import { ChurchPersonDto } from '@/features/groups/types/group.types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export function MentorshipDetail({ id }: { id: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const { persons = [] } = useChurchPersons();
    const { data, isLoading, isError, mutate } = useMentorshipDetail(id);
    const { createMeeting, isMutating: isCreatingMeeting } = useCreateMeeting();
    const { deleteTask } = useDeleteTask();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [meetingToEdit, setMeetingToEdit] = useState<any>(null);
    
    // States for task actions
    const [taskToSubmit, setTaskToSubmit] = useState<string | null>(null);
    const [menteeResponse, setMenteeResponse] = useState('');
    const [taskToReview, setTaskToReview] = useState<string | null>(null);
    const [mentorFeedback, setMentorFeedback] = useState('');
    const [taskToEdit, setTaskToEdit] = useState<any | null>(null);
    const [taskToView, setTaskToView] = useState<any | null>(null);
    const [preselectedMeetingId, setPreselectedMeetingId] = useState<string | undefined>(undefined);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);
    
    // Process-specific role detection
    const myParticipation = data?.participants?.find(p => p.churchPersonId === (user as any)?.memberId);
    const isProcessMentor = myParticipation?.role === 'MENTOR';
    const isProcessMentee = myParticipation?.role === 'PARTICIPANT';
    const canManage = isProcessMentor;
    const isPending = myParticipation?.status === 'PENDING';

    const handleDeleteMeeting = async (meetingId: string) => {
        if (!canManage) return;
        if (!confirm('¿Estás seguro de que deseas eliminar este encuentro?')) return;
        try {
            await mentorshipService.deleteMeeting(id, meetingId);
            toast.success('Encuentro eliminado');
            if (data) {
                data.meetings = data.meetings.filter(m => m.id !== meetingId); // optimistic
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar el encuentro');
        }
    };

    const handleEditMeeting = (meeting: any) => {
        const calType = 
            data?.type === 'DISCIPLESHIP' ? CalendarEventType.DISCIPLESHIP : 
            data?.type === 'FOLLOW_UP' ? CalendarEventType.FOLLOW_UP : CalendarEventType.COUNSELING;

        setMeetingToEdit({
            id: meeting.id,
            title: meeting.title || 'Encuentro de Mentoría',
            description: meeting.description || '',
            location: meeting.location || '',
            startDate: meeting.scheduledDate,
            endDate: meeting.endDate || new Date(new Date(meeting.scheduledDate).getTime() + 60 * 60 * 1000).toISOString(),
            type: calType,
            color: EVENT_TYPE_COLORS[calType],
        });
    };

    const handleUpdateMeeting = async (meetingData: any) => {
        if (!canManage || !meetingToEdit) return;
        try {
            await mentorshipService.updateMeeting(id, meetingToEdit.id, {
                title: meetingData.title,
                description: meetingData.description,
                color: meetingData.color,
                location: meetingData.location,
                scheduledDate: meetingData.startDate,
                endDate: meetingData.endDate,
                type: meetingData.type
            });
            setMeetingToEdit(null);
            mutate();
        } catch (error) {
            console.error(error);
            throw new Error('No se pudo actualizar el encuentro.');
        }
    };

    const handleCreateMeeting = async (meetingData: any) => {
        if (!canManage) return;
        await createMeeting({
            mentorshipId: id,
            payload: {
                title: meetingData.title,
                description: meetingData.description,
                color: meetingData.color,
                location: meetingData.location,
                scheduledDate: meetingData.startDate,
                endDate: meetingData.endDate,
                type: meetingData.type
            }
        });
        mutate();
    };

    const handleStartTask = async (taskId: string) => {
        if (!isProcessMentee) return;
        try {
            await mentorshipService.startTask(taskId);
            toast.success('Tarea iniciada');
            mutate();
        } catch (error) {
            toast.error('Error al iniciar la tarea');
        }
    };

    const handleSubmitTask = async () => {
        if (!taskToSubmit) return;
        setIsSubmittingAction(true);
        try {
            await mentorshipService.submitTask(taskToSubmit, { menteeResponse });
            toast.success('Tarea enviada');
            setTaskToSubmit(null);
            setMenteeResponse('');
            mutate();
        } catch (error) {
            toast.error('Error al enviar la tarea');
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const handleReviewTask = async () => {
        if (!canManage || !taskToReview) return;
        setIsSubmittingAction(true);
        try {
            await mentorshipService.reviewTask(taskToReview, { mentorFeedback });
            toast.success('Tarea revisada');
            setTaskToReview(null);
            setMentorFeedback('');
            mutate();
        } catch (error) {
            toast.error('Error al revisar la tarea');
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
        try {
            await deleteTask({ mentorshipId: id, taskId });
            toast.success('Tarea eliminada');
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar tarea');
        }
    };

    const getPersonName = (id: string) => {
        const found = persons.find((p: ChurchPersonDto) => p.id === id);
        return found?.person?.fullName || 'Usuario Desconocido';
    };

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

    const getTaskStatusConfig = (s: string) => {
        switch (s) {
            case 'ASSIGNED': return { label: 'Asignada', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock };
            case 'IN_PROGRESS': return { label: 'En Progreso', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Activity };
            case 'SUBMITTED': return { label: 'Entregada', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: Send };
            case 'REVIEWED': return { label: 'Revisada', color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle };
            default: return { label: s, color: 'bg-slate-100 text-slate-600', icon: Clock };
        }
    };

    const getParticipantStatusConfig = (s: string) => {
        switch (s) {
            case 'ACCEPTED': return { label: 'Aceptado', color: 'bg-green-100 text-green-700' };
            case 'PENDING': return { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' };
            case 'DECLINED': return { label: 'Rechazado', color: 'bg-red-100 text-red-700' };
            case 'AUTO_ACCEPTED': return { label: 'Auto-aceptado', color: 'bg-blue-100 text-blue-700' };
            default: return { label: s, color: 'bg-slate-100 text-slate-700' };
        }
    };

    if (isLoading || !data) {
        return (
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-pulse">
                <div className="h-8 w-32 bg-slate-200 rounded-md mb-8"></div>
                <div className="h-32 w-full bg-slate-100 rounded-2xl border border-slate-200"></div>
                <div className="h-10 w-64 bg-slate-200 rounded-md"></div>
                <div className="h-64 w-full bg-slate-50 rounded-2xl border border-slate-200"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 p-4 md:p-8 pt-6">
                <Button variant="ghost" onClick={() => router.push('/mentorship')} className="mb-6 -ml-4 text-slate-500">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Volver al listado
                </Button>
                <div className="p-12 border rounded-2xl border-dashed border-red-200 bg-red-50 flex flex-col items-center text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-red-900">Error al cargar el proceso</h3>
                    <p className="text-red-600 mt-1">No pudimos obtener la información de esta mentoría. Por favor, intenta de nuevo.</p>
                </div>
            </div>
        );
    }

    // Role-based logic filtering (Backend should also filter this, frontend projection helps UI logic)
    const visibleNotes = data.notes?.filter(note => {
        if (isProcessMentee) return note.type === 'SHARED';
        return true; // Mentors see all
    }) || [];

    const mentors = data.participants?.filter(p => p.role === 'MENTOR') || [];
    const mentees = data.participants?.filter(p => p.role === 'PARTICIPANT') || [];

    const handleCreateTaskForMeeting = (meetingId: string) => {
        setPreselectedMeetingId(meetingId);
        setIsCreateTaskOpen(true);
        setActiveTab('tasks');
    };
    const visibleTasks = data.tasks?.filter(task => {
        if (canManage) return true;
        const currentUserId = (user as any)?.memberId || (user as any)?.personId || user?.id;
        return task.assignedChurchPersonId === currentUserId || task.isGroupTask;
    }) || [];

    // Activity Feed Generation (Mocking recent events from existing data)
    const activities = [
        ...visibleNotes.map(n => ({ id: n.id, type: 'note', title: 'Nueva nota creada', date: n.createdAt, user: getPersonName(n.authorChurchPersonId) })),
        ...visibleTasks.map(t => ({ id: t.id, type: 'task', title: `Tarea: ${t.title}`, date: t.completedAt || t.dueDate || data.createdAt, status: t.status, user: t.assignedChurchPersonId ? getPersonName(t.assignedChurchPersonId) : undefined })),
        ...data.meetings.map(m => ({ id: m.id, type: 'meeting', title: m.title || 'Encuentro programado', date: m.scheduledDate, user: undefined }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);


    const handleAcceptInvitation = async () => {
        if (!myParticipation) return;
        try {
            await mentorshipService.acceptParticipation(myParticipation.id);
            toast.success('¡Invitación aceptada!');
            mutate();
        } catch (error) {
            toast.error('Error al aceptar la invitación');
        }
    };

    const handleDeclineInvitation = async () => {
        if (!myParticipation) return;
        if (!confirm('¿Estás seguro de que deseas rechazar esta invitación? No podrás ver el proceso después.')) return;
        try {
            await mentorshipService.declineParticipation(myParticipation.id);
            toast.success('Invitación rechazada');
            router.push('/mentorship');
        } catch (error) {
            toast.error('Error al rechazar la invitación');
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

            {isPending && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 leading-tight">Tienes una invitación pendiente</h3>
                            <p className="text-amber-700 text-sm mt-0.5">
                                {data.mentorSummary || 'Un mentor'} te ha invitado a este proceso de acompañamiento.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button 
                            variant="outline" 
                            className="flex-1 md:flex-none border-amber-200 text-amber-800 hover:bg-amber-100 font-bold"
                            onClick={handleDeclineInvitation}
                        >
                            Rechazar
                        </Button>
                        <Button 
                            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md shadow-indigo-200"
                            onClick={handleAcceptInvitation}
                        >
                            Aceptar Invitación
                        </Button>
                    </div>
                </div>
            )}

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
                            {data.motive || 'Proceso de Mentoría'}
                        </h2>
                        <div className="flex items-center text-slate-500 mt-2 text-sm font-medium">
                            <Calendar className="w-4 h-4 mr-2" />
                            Iniciado el {format(new Date(data.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mentor Asignado</p>
                            <div className="font-bold text-slate-800 flex items-center text-sm">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] mr-2">
                                    {data.mentorSummary?.charAt(0) || 'M'}
                                </span>
                                {data.mentorSummary || 'No asignado'}
                            </div>
                        </div>
                        <div className="hidden sm:block w-px bg-slate-200 mx-1"></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guiado / Discípulo</p>
                            <div className="font-bold text-slate-800 flex items-center text-sm">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] mr-2">
                                    {data.menteeSummary?.charAt(0) || 'G'}
                                </span>
                                {data.menteeSummary || 'Desconocido'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-auto inline-flex flex-wrap shadow-sm w-full md:w-auto">
                    <TabsTrigger value="overview" className="flex-1 md:flex-none px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Activity className="w-4 h-4 mr-2 hidden sm:inline" />
                        Resumen
                    </TabsTrigger>
                    <TabsTrigger value="meetings" className="flex-1 md:flex-none px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Calendar className="w-4 h-4 mr-2 hidden sm:inline" />
                        Encuentros
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="flex-1 md:flex-none px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <ClipboardCheck className="w-4 h-4 mr-2 hidden sm:inline" />
                        Tareas <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600 border-none">{data.tasks?.length || 0}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex-1 md:flex-none px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <MessageSquareQuote className="w-4 h-4 mr-2 hidden sm:inline" />
                        Notas <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600 border-none">{visibleNotes.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="participants" className="flex-1 md:flex-none px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Users className="w-4 h-4 mr-2 hidden sm:inline" />
                        Participantes
                    </TabsTrigger>
                </TabsList>

                {/* TAB: Resumen (Overview) */}
                <TabsContent value="overview" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Summary Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium text-sm">
                                        <Calendar className="w-4 h-4" />
                                        Próximo Encuentro
                                    </div>
                                    <div className="text-lg font-bold text-slate-900">
                                        {data.meetings.find(m => !m.isCompleted && new Date(m.scheduledDate) >= new Date())?.title || 'No hay programados'}
                                    </div>
                                    {data.meetings.find(m => !m.isCompleted && new Date(m.scheduledDate) >= new Date()) && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {format(new Date(data.meetings.find(m => !m.isCompleted && new Date(m.scheduledDate) >= new Date())!.scheduledDate), "d 'de' MMMM, HH:mm", { locale: es })}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium text-sm">
                                        <CheckSquare className="w-4 h-4" />
                                        Tareas Pendientes
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900">
                                        {visibleTasks.filter(t => t.status !== 'REVIEWED').length}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">De un total de {visibleTasks.length} tareas asignadas</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" />
                                        Progreso General
                                    </h3>
                                    <span className="text-sm font-bold text-primary">
                                        {visibleTasks.length > 0 ? Math.round((visibleTasks.filter(t => t.status === 'REVIEWED').length / visibleTasks.length) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-primary h-full transition-all duration-1000" 
                                        style={{ width: `${visibleTasks.length > 0 ? (visibleTasks.filter(t => t.status === 'REVIEWED').length / visibleTasks.length) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Encuentros</p>
                                        <p className="text-xl font-bold text-slate-800">{data.meetings.length}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notas</p>
                                        <p className="text-xl font-bold text-slate-800">{visibleNotes.length}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tareas</p>
                                        <p className="text-xl font-bold text-slate-800">{visibleTasks.length}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estatus</p>
                                        <p className={`text-sm font-bold uppercase ${statusConfig.color.replace('bg-', 'text-').split(' ')[1]}`}>
                                            {statusConfig.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Feed Column */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                Actividad Reciente
                            </h3>
                            <div className="space-y-6">
                                {activities.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-8">No hay actividad reciente registrada.</p>
                                ) : (
                                    activities.map((act, idx) => (
                                        <div key={idx} className="flex gap-4 relative">
                                            {idx !== activities.length - 1 && (
                                                <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-slate-100 -mb-6"></div>
                                            )}
                                            <div className={`w-4 h-4 rounded-full border-2 border-white ring-4 ring-slate-50 shrink-0 mt-1 ${
                                                act.type === 'note' ? 'bg-primary' : act.type === 'task' ? 'bg-amber-400' : 'bg-blue-400'
                                            }`}></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{act.title}</p>
                                                {act.user && <p className="text-xs text-slate-500 mt-0.5 font-medium">{act.user}</p>}
                                                <p className="text-[10px] text-slate-400 mt-1 font-bold">
                                                    {format(new Date(act.date), "d MMM, HH:mm", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: Encuentros */}
                <TabsContent value="meetings" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Encuentros y Reuniones</h3>
                        {canManage && (
                            <CreateEventDialog
                                onEventCreated={() => { mutate(); }}
                                onSubmitOverride={handleCreateMeeting}
                                defaultType={
                                    data?.type === 'DISCIPLESHIP' ? CalendarEventType.DISCIPLESHIP : 
                                    data?.type === 'FOLLOW_UP' ? CalendarEventType.FOLLOW_UP : CalendarEventType.COUNSELING
                                }
                                trigger={
                                    <Button variant="outline" className="font-semibold" size="sm" disabled={isCreatingMeeting}>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Programar Encuentro
                                    </Button>
                                }
                            />
                        )}
                    </div>
                    <div className="space-y-4">
                        {!data.meetings || data.meetings.length === 0 ? (
                            <div className="p-12 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                                <Clock className="w-10 h-10 text-slate-300 mb-4" />
                                <h4 className="text-lg font-bold text-slate-900">Sin encuentros aún</h4>
                                <p className="text-slate-500 mt-1 max-w-sm">No se han registrado reuniones programadas o pasadas en este proceso.</p>
                            </div>
                        ) : (
                            data.meetings.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()).map(meeting => (
                                <UniversalMeetingCard
                                    key={meeting.id}
                                    id={meeting.id}
                                    date={meeting.scheduledDate}
                                    title={meeting.title || "Encuentro de Mentoría"}
                                    timeLabel={format(new Date(meeting.scheduledDate), "HH:mm")}
                                    location={meeting.location || 'Ubicación no especificada'}
                                    description={meeting.description}
                                    isPast={new Date(meeting.scheduledDate) < new Date()}
                                    type={data?.type === 'DISCIPLESHIP' ? CalendarEventType.DISCIPLESHIP : CalendarEventType.COUNSELING}
                                    extraBadge={
                                        <Badge variant="outline" className={meeting.isCompleted ? "border-green-200 text-green-700 bg-green-50" : "border-amber-200 text-amber-700 bg-amber-50"}>
                                            {meeting.isCompleted ? 'Completado' : 'Pendiente'}
                                        </Badge>
                                    }
                                    onEdit={canManage ? () => handleEditMeeting(meeting) : undefined}
                                    onDelete={canManage ? () => handleDeleteMeeting(meeting.id) : undefined}
                                    actions={canManage && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-7 text-[10px] font-bold border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700"
                                            onClick={() => handleCreateTaskForMeeting(meeting.id)}
                                        >
                                            <CheckSquare className="w-3 h-3 mr-1.5" />
                                            Asignar Tarea
                                        </Button>
                                    )}
                                />
                            ))
                        )}
                    </div>

                    {meetingToEdit && (
                        <CreateEventDialog
                            onEventCreated={() => { setMeetingToEdit(null); mutate(); }}
                            onSubmitOverride={handleUpdateMeeting}
                            eventToEdit={meetingToEdit}
                            open={!!meetingToEdit}
                            onOpenChange={(open) => !open && setMeetingToEdit(null)}
                        />
                    )}
                </TabsContent>

                {/* TAB: Tareas */}
                <TabsContent value="tasks" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Tareas Asignadas</h3>
                        {canManage && (
                            <MentorshipCreateTaskDialog
                                mentorshipId={id}
                                participants={data.participants || []}
                                getPersonName={getPersonName}
                                meetings={data.meetings || []}
                                initialMeetingId={preselectedMeetingId}
                                open={isCreateTaskOpen}
                                onOpenChange={setIsCreateTaskOpen}
                            />
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visibleTasks.length === 0 ? (
                            <div className="md:col-span-2 p-12 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                                <CheckSquare className="w-10 h-10 text-slate-300 mb-4" />
                                <h4 className="text-lg font-bold text-slate-900">Sin tareas asignadas</h4>
                                <p className="text-slate-500 mt-1 max-w-sm">
                                    {isProcessMentee ? "No tienes tareas pendientes asignadas en este momento." : "Asigna lecturas, actividades o metas a los participantes del proceso."}
                                </p>
                            </div>
                        ) : (
                            visibleTasks.map(task => {
                                const stConfig = getTaskStatusConfig(task.status);
                                const TaskIcon = stConfig.icon;
                                const currentUserId = (user as any)?.memberId || (user as any)?.personId || user?.id;
                                const isAssignedToMe = task.assignedChurchPersonId === currentUserId || task.isGroupTask;

                                return (
                                    <div key={task.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                        <div className="p-5 flex-1">
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <Badge className={`shadow-none border ${stConfig.color} px-2 py-0.5`} variant="secondary">
                                                    <TaskIcon className="w-3 h-3 mr-1.5" />
                                                    {stConfig.label}
                                                </Badge>
                                                {task.dueDate && (
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {format(new Date(task.dueDate), "d 'de' MMM", { locale: es })}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-slate-900 mb-1">{task.title}</h4>
                                            {task.description && <p className="text-sm text-slate-500 line-clamp-1 mb-3">{task.description}</p>}
                                            
                                            <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-50">
                                                {task.assignedChurchPersonId && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                            <User className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-[10px] font-medium text-slate-600">
                                                            {getPersonName(task.assignedChurchPersonId)}
                                                        </span>
                                                    </div>
                                                )}
                                                {task.isGroupTask && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-[10px] font-medium text-slate-500">Grupal</span>
                                                    </div>
                                                )}
                                                {task.meetingId && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-[10px] font-medium text-slate-500">Vinculada</span>
                                                    </div>
                                                )}
                                            </div>

                                            {(task.menteeResponse || task.mentorFeedback) && (
                                                <div className="mt-4 space-y-2">
                                                    {task.menteeResponse && (
                                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 italic text-xs text-slate-600">
                                                            <p className="font-bold text-[10px] text-slate-400 mb-1 not-italic">RESPUESTA:</p>
                                                            "{task.menteeResponse}"
                                                        </div>
                                                    )}
                                                    {task.mentorFeedback && (
                                                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 text-xs text-blue-700">
                                                            <p className="font-bold text-[10px] text-blue-400 mb-1">FEEDBACK:</p>
                                                            {task.mentorFeedback}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Bar Simplified */}
                                        <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-8 text-xs font-bold text-primary hover:bg-primary/5 px-3" 
                                                onClick={() => setTaskToView(task)}
                                            >
                                                Ver Tarea
                                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                            </Button>

                                            {canManage && (
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => setTaskToEdit(task)}>
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteTask(task.id)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </TabsContent>

                {/* TAB: Notas */}
                <TabsContent value="notes" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Historial de Notas</h3>
                        {canManage && <MentorshipCreateNoteDialog mentorshipId={id} isMentee={isProcessMentee} />}
                    </div>
                    <div className="space-y-4">
                        {visibleNotes.length === 0 ? (
                            <div className="p-12 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                                <MessageSquare className="w-10 h-10 text-slate-300 mb-4" />
                                <h4 className="text-lg font-bold text-slate-900">Sin notas registradas</h4>
                                <p className="text-slate-500 mt-1 max-w-sm">
                                    {isProcessMentee ? "No hay notas visibles para ti en este proceso." : "No se han añadido observaciones o notas a este acompañamiento."}
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
                                                {note.type === 'INTERNAL' ? 'Interna' : 'Supervisión'}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">{note.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* TAB: Participantes */}
                <TabsContent value="participants" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Integrantes del Proceso</h3>
                        <div className="space-y-4">
                            {data.participants?.map(p => {
                                const st = getParticipantStatusConfig(p.status);
                                return (
                                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${p.role === 'MENTOR' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {getPersonName(p.churchPersonId).substring(0, 1)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{getPersonName(p.churchPersonId)}</p>
                                                <p className="text-xs text-slate-500 font-medium">{p.role === 'MENTOR' ? 'Mentor Principal' : 'Persona Guiada'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={`shadow-none border-none ${st.color}`}>
                                                {st.label}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:block">
                                                Desde {format(new Date(p.joinedAt), "MMM yyyy", { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Action Modals */}
            <Dialog open={!!taskToSubmit} onOpenChange={(o) => !o && setTaskToSubmit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enviar Respuesta de Tarea</DialogTitle>
                        <DialogDescription>
                            Completa esta tarea enviando tu respuesta o progreso al mentor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Label htmlFor="response">Tu respuesta / Comentario</Label>
                        <Textarea 
                            id="response" 
                            placeholder="Describe lo que realizaste o tus reflexiones..." 
                            className="h-32"
                            value={menteeResponse}
                            onChange={(e) => setMenteeResponse(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTaskToSubmit(null)} disabled={isSubmittingAction}>Cancelar</Button>
                        <Button onClick={handleSubmitTask} disabled={isSubmittingAction || !menteeResponse.trim()}>
                            {isSubmittingAction ? 'Enviando...' : 'Enviar Tarea'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!taskToReview} onOpenChange={(o) => !o && setTaskToReview(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revisar Tarea</DialogTitle>
                        <DialogDescription>
                            Proporciona feedback al guiado y cierra esta tarea como realizada.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg border text-sm italic text-slate-600 mb-4">
                            <strong>Respuesta del guiado:</strong><br/>
                            "{data.tasks.find(t => t.id === taskToReview)?.menteeResponse || 'Sin respuesta'}"
                        </div>
                        <Label htmlFor="feedback">Feedback / Observaciones (Opcional)</Label>
                        <Textarea 
                            id="feedback" 
                            placeholder="Escribe tus consejos o comentarios sobre el trabajo realizado..." 
                            className="h-28"
                            value={mentorFeedback}
                            onChange={(e) => setMentorFeedback(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTaskToReview(null)} disabled={isSubmittingAction}>Cancelar</Button>
                        <Button onClick={handleReviewTask} disabled={isSubmittingAction} className="bg-green-600 hover:bg-green-700">
                            {isSubmittingAction ? 'Procesando...' : 'Marcar como Revisada'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Edit Task Dialog */}
            {taskToEdit && (
                <MentorshipEditTaskDialog
                    task={taskToEdit}
                    mentorshipId={id}
                    participants={data.participants || []}
                    getPersonName={getPersonName}
                    meetings={data.meetings || []}
                    open={!!taskToEdit}
                    onOpenChange={(open) => !open && setTaskToEdit(null)}
                />
            )}
            {/* View Task Dialog */}
            {taskToView && (
                <MentorshipTaskViewDialog
                    task={taskToView}
                    mentorshipId={id}
                    canManage={canManage}
                    isMentee={isProcessMentee}
                    getPersonName={getPersonName}
                    open={!!taskToView}
                    onOpenChange={(open) => !open && setTaskToView(null)}
                    onEdit={(t) => setTaskToEdit(t)}
                    mutate={mutate}
                />
            )}
        </div>
    );
}
