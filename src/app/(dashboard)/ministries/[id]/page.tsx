'use client';

import { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
    Users,
    Calendar as CalendarIcon,
    CheckSquare,
    Settings,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Settings2,
    ShieldCheck,
    Mail,
    UserPlus,
    Loader2
} from "lucide-react";
import { toast } from 'sonner';
import { Ministry, MinistryTask } from '@/types/ministry';
import { CalendarEvent, CalendarEventType } from '@/types/agenda';

import { AddMemberDialog } from '../add-member-dialog';
import { EditMinistryDialog } from '../edit-ministry-dialog';
import { CreateTaskDialog } from '../create-task-dialog';
import { CompleteTaskDialog } from '../complete-task-dialog';
import { CreateNoteDialog } from '../create-note-dialog';
import { CreateEventDialog } from '../../agenda/create-event-dialog';
import { useAuth } from '@/context/AuthContext';
import { useMinistryPermissions } from '@/hooks/useMinistryPermissions';
import { MinistryMembersTab } from './components/MinistryMembersTab';
import { MinistryTasksTab } from './components/MinistryTasksTab';
import { MinistryAgendaTab } from './components/MinistryAgendaTab';
import { MinistryConfigTab } from './components/MinistryConfigTab';
export default function MinistryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [ministry, setMinistry] = useState<Ministry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('members');

    // Pagination state for tasks
    const [tasks, setTasks] = useState<MinistryTask[]>([]);
    const [tasksPage, setTasksPage] = useState(1);
    const [tasksTotal, setTasksTotal] = useState(0);
    const [isTasksLoading, setIsTasksLoading] = useState(false);
    const [activeTaskTab, setActiveTaskTab] = useState<'pending' | 'finished'>('pending');
    const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<MinistryTask | null>(null);
    const [isCompleteTaskOpen, setIsCompleteTaskOpen] = useState(false);
    const [taskToComplete, setTaskToComplete] = useState<MinistryTask | null>(null);
    const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);

    // Alert Dialog States
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
    const [taskToReopen, setTaskToReopen] = useState<MinistryTask | null>(null);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);
    const [isDeletingMember, setIsDeletingMember] = useState(false);
    const [isReopeningTask, setIsReopeningTask] = useState(false);
    const [isDeletingEvent, setIsDeletingEvent] = useState(false);

    // Calendar & Notes State
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
    const [noteEventId, setNoteEventId] = useState<string | null>(null);
    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const [pastEventsLimit, setPastEventsLimit] = useState(5);

    const { isLeader, isLeaderOrCoordinator, canManageTask } = useMinistryPermissions(ministry, user);

    // --- TASKS ACTIONS ---
    const handleTaskCreated = () => {
        fetchMinistry();
        fetchTasks(1, activeTaskTab);
        setIsCreateTaskOpen(false);
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${id}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al eliminar tarea');
            toast.success('Tarea eliminada');
            fetchMinistry();
            fetchTasks(tasksPage, activeTaskTab);
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar tarea');
        }
    };



    useEffect(() => {
        fetchMinistry();
        fetchTasks(1, 'pending');
        setActiveTaskTab('pending');
    }, [id]);

    const fetchTasks = async (page = 1, status = activeTaskTab) => {
        setIsTasksLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${id}/tasks?page=${page}&limit=10&status=${status}&t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            if (!res.ok) throw new Error('Error al cargar tareas');
            const data = await res.json();
            setTasks(data.data);
            setTasksTotal(data.total);
            setTasksPage(data.page);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar las tareas');
        } finally {
            setIsTasksLoading(false);
        }
    };

    const fetchMinistry = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al cargar ministerio');
            const data = await res.json();
            setMinistry(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el ministerio');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        setIsDeletingMember(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${id}/members/${memberToRemove}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error al eliminar miembro');
            toast.success('Miembro eliminado');
            fetchMinistry();
            setMemberToRemove(null);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar al miembro');
        } finally {
            setIsDeletingMember(false);
        }
    };

    const handleToggleTask = async (task: MinistryTask) => {
        if (task.status === 'in_progress') {
            setTaskToComplete(task);
            setIsCompleteTaskOpen(true);
            return;
        }

        if (task.status !== 'pending') {
            setTaskToReopen(task);
            return;
        }

        // Optimistic update for pending -> in_progress
        const newStatus = 'in_progress';
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${id}/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, observation: '' })
            });

            if (!res.ok) throw new Error('Error al actualizar tarea');
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar estado de la misión');
            fetchMinistry();
            fetchTasks(tasksPage, activeTaskTab); // Revert on error
        }
    };

    const confirmReopenTask = async () => {
        if (!taskToReopen) return;
        setIsReopeningTask(true);
        // Optimistic update
        setTasks(prev => prev.filter(t => t.id !== taskToReopen.id));

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${id}/tasks/${taskToReopen.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'pending', observation: '' })
            });

            if (!res.ok) throw new Error('Error al actualizar tarea');
            toast.success('La tarea ha sido reabierta a Pendiente.');
            fetchTasks(tasksPage, activeTaskTab);
            setTaskToReopen(null);
        } catch (error) {
            console.error(error);
            toast.error('Error al reabrir la misión');
            fetchMinistry();
            fetchTasks(tasksPage, activeTaskTab); // Revert on error
        } finally {
            setIsReopeningTask(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!ministry) return null;

    const eventsWithNotes = ministry.calendarEvents?.filter((e: any) => e.meetingNote) || [];

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-0">
            {/* Dialogs */}
            <EditMinistryDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                ministry={ministry}
                onSuccess={fetchMinistry}
            />
            <AddMemberDialog
                open={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
                ministryId={ministry.id}
                onSuccess={fetchMinistry}
            />
            <CreateTaskDialog
                open={isCreateTaskOpen}
                onOpenChange={(open) => {
                    setIsCreateTaskOpen(open);
                    if (!open) setTaskToEdit(null);
                }}
                ministryId={ministry.id}
                onSuccess={handleTaskCreated}
                taskToEdit={taskToEdit}
            />
            <CreateNoteDialog
                open={isNoteOpen}
                onOpenChange={(open) => {
                    setIsNoteOpen(open);
                    if (!open) setNoteEventId(null);
                }}
                ministryId={ministry.id}
                eventId={noteEventId}
                isLeaderOrCoordinator={isLeaderOrCoordinator}
                onSuccess={fetchMinistry}
            />
            <CreateEventDialog
                open={!!eventToEdit}
                onOpenChange={(open: boolean) => !open && setEventToEdit(null)}
                eventToEdit={eventToEdit || undefined}
                defaultType={CalendarEventType.MINISTRY}
                onEventCreated={fetchMinistry}
                trigger={<span className="hidden" />}
            />
            <CompleteTaskDialog
                open={isCompleteTaskOpen}
                onOpenChange={(open) => {
                    setIsCompleteTaskOpen(open);
                    if (!open) setTaskToComplete(null);
                }}
                ministryId={ministry.id}
                task={taskToComplete}
                onSuccess={() => fetchTasks(tasksPage, activeTaskTab)}
            />

            {/* Alert Dialogs */}
            <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
                <AlertDialogContent className="rounded-3xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Quitar Integrante</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro que deseas quitar a este miembro del ministerio? No podrá ver ni gestionar la agenda o tareas de este equipo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="font-bold rounded-xl border-slate-200" disabled={isDeletingMember}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white gap-2"
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemoveMember();
                            }}
                            disabled={isDeletingMember}
                        >
                            {isDeletingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Quitar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!taskToReopen} onOpenChange={(open) => !open && setTaskToReopen(null)}>
                <AlertDialogContent className="rounded-3xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Reabrir Misión</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Deseas marcar la misión <span className="font-bold text-slate-700">"{taskToReopen?.title}"</span> como pendiente nuevamente?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="font-bold rounded-xl border-slate-200" disabled={isReopeningTask}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            onClick={(e) => {
                                e.preventDefault();
                                confirmReopenTask();
                            }}
                            disabled={isReopeningTask}
                        >
                            {isReopeningTask ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Reabrir Misión
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <AlertDialogContent className="rounded-3xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Eliminar Evento</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Eliminar este evento y su bitácora asociada? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="font-bold rounded-xl border-slate-200" disabled={isDeletingEvent}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white gap-2"
                            onClick={async (e) => {
                                e.preventDefault();
                                if (!eventToDelete) return;
                                setIsDeletingEvent(true);
                                try {
                                    const token = localStorage.getItem('accessToken');
                                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agenda/${eventToDelete}`, {
                                        method: 'DELETE',
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    toast.success('Evento eliminado');
                                    fetchMinistry();
                                    setEventToDelete(null);
                                } catch (err) {
                                    toast.error('Error al eliminar evento');
                                } finally {
                                    setIsDeletingEvent(false);
                                }
                            }}
                            disabled={isDeletingEvent}
                        >
                            {isDeletingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Eliminar Evento
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/ministries')}>Ministerios</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900">{ministry.name}</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{ministry.name}</h1>
                            <Badge className="font-bold gap-1" style={{ backgroundColor: ministry.status === 'active' ? '#dcfce7' : '#f1f5f9', color: ministry.status === 'active' ? '#166534' : '#64748b' }}>
                                {ministry.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {ministry.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-medium max-w-2xl">{ministry.description || 'Sin descripción.'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    <Button
                        variant="default"
                        size="sm"
                        className="font-bold gap-2 text-white bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => router.push(`/ministries/${id}/schedule`)}
                    >
                        <CalendarIcon className="w-4 h-4" />
                        Cronograma
                    </Button>
                    {isLeaderOrCoordinator && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-bold gap-2 text-slate-600"
                            onClick={() => setIsEditDialogOpen(true)}
                        >
                            <Settings2 className="w-4 h-4" />
                            Configurar
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-4 gap-6">

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                        <div className="h-2 w-full" style={{ backgroundColor: ministry.color }}></div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {ministry.description || 'Sin descripción.'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Líder Principal</p>
                                    {ministry.leader ? (
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                                                {ministry.leader.person.avatarUrl ? (
                                                    <img src={ministry.leader.person.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : <ShieldCheck className="w-5 h-5 text-indigo-500" />}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-slate-800 truncate">
                                                    {ministry.leader.person.firstName} {ministry.leader.person.lastName}
                                                </p>
                                                <div className="flex items-center gap-2 opacity-60">
                                                    <Mail className="w-3 h-3" />
                                                    <p className="text-[10px] truncate">{ministry.leader.person.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No asignado</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-between">
                                <div className="text-center px-4">
                                    <p className="text-xl font-black text-slate-900">{ministry.members?.length || 0}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Miembros</p>
                                </div>
                                <div className="w-px h-8 bg-slate-100"></div>
                                <div className="text-center px-4">
                                    <p className="text-xl font-black text-slate-900">{ministry.tasks?.filter(t => t.status === 'pending').length || 0}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Tareas</p>
                                </div>
                                <div className="w-px h-8 bg-slate-100"></div>
                                <div className="text-center px-4">
                                    <p className="text-xl font-black text-slate-900">{ministry.calendarEvents?.length || 0}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Eventos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {isLeader && (
                        <Button className="w-full h-12 rounded-2xl font-bold gap-2 bg-slate-900 hover:bg-slate-800" onClick={() => setIsAddMemberOpen(true)}>
                            <UserPlus className="w-5 h-5" />
                            Añadir Integrante
                        </Button>
                    )}
                </div>

                {/* Main Content Tabs */}
                <div className="lg:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 border border-slate-200/60 w-full lg:w-max grid grid-cols-4 lg:flex lg:gap-2">
                            <TabsTrigger value="members" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary font-bold text-xs gap-2">
                                <Users className="w-4 h-4 hidden sm:block" />
                                Integrantes
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary font-bold text-xs gap-2">
                                <CalendarIcon className="w-4 h-4 hidden sm:block" />
                                Calendario
                            </TabsTrigger>
                            <TabsTrigger value="tasks" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary font-bold text-xs gap-2">
                                <CheckSquare className="w-4 h-4 hidden sm:block" />
                                Tareas
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="hidden">
                            </TabsTrigger>
                            <TabsTrigger value="config" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary font-bold text-xs gap-2">
                                <Settings className="w-4 h-4 hidden sm:block" />
                                Roles en Culto
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="members" className="outline-none">
                            <MinistryMembersTab
                                ministry={ministry}
                                isLeader={isLeader}
                                onRemoveMember={setMemberToRemove}
                                onSuccess={fetchMinistry}
                            />
                        </TabsContent>

                        <TabsContent value="calendar" className="outline-none">
                            <MinistryAgendaTab
                                ministry={ministry}
                                isLeaderOrCoordinator={isLeaderOrCoordinator}
                                pastEventsLimit={pastEventsLimit}
                                setPastEventsLimit={setPastEventsLimit}
                                setNoteEventId={setNoteEventId}
                                setIsNoteOpen={setIsNoteOpen}
                                setEventToEdit={setEventToEdit}
                                handleDeleteEvent={setEventToDelete}
                                fetchMinistry={fetchMinistry}
                            />
                        </TabsContent>

                        <TabsContent value="tasks" className="outline-none">
                            <MinistryTasksTab
                                ministry={ministry}
                                tasks={tasks}
                                tasksPage={tasksPage}
                                tasksTotal={tasksTotal}
                                isTasksLoading={isTasksLoading}
                                activeTaskTab={activeTaskTab}
                                setActiveTaskTab={setActiveTaskTab}
                                fetchTasks={fetchTasks}
                                isLeaderOrCoordinator={isLeaderOrCoordinator}
                                canManageTask={canManageTask}
                                setIsCreateTaskOpen={setIsCreateTaskOpen}
                                handleToggleTask={handleToggleTask}
                                handleDeleteTask={handleDeleteTask}
                                handleEditTask={(task) => {
                                    setTaskToEdit(task);
                                    setIsCreateTaskOpen(true);
                                }}
                            />
                        </TabsContent>



                        <TabsContent value="config" className="outline-none">
                            <MinistryConfigTab ministry={ministry} fetchMinistry={fetchMinistry} isLeaderOrCoordinator={isLeaderOrCoordinator} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div >
    );
}
