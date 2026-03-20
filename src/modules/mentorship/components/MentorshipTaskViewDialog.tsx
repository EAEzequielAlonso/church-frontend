'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    Clock, 
    CheckCircle, 
    Send, 
    Activity, 
    User, 
    Calendar, 
    MessageSquare, 
    FileText, 
    Loader2,
    ChevronRight,
    Edit 
} from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

import { mentorshipService } from '../services/mentorship.service';
import { MentorshipTask } from '../types/mentorship-detail.types';

interface MentorshipTaskViewDialogProps {
    task: any;
    mentorshipId: string;
    canManage: boolean;
    isMentee: boolean;
    getPersonName: (id: string) => string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (task: any) => void;
    mutate: () => void;
}

export function MentorshipTaskViewDialog({
    task: initialTask,
    mentorshipId,
    canManage,
    isMentee,
    getPersonName,
    open,
    onOpenChange,
    onEdit,
    mutate
}: MentorshipTaskViewDialogProps) {
    const [task, setTask] = useState<MentorshipTask>(initialTask);
    const [activeTab, setActiveTab] = useState('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [menteeResponse, setMenteeResponse] = useState(initialTask.menteeResponse || '');
    const [mentorFeedback, setMentorFeedback] = useState(initialTask.mentorFeedback || '');

    // Sync local task state when prop changes
    useEffect(() => {
        setTask(initialTask);
        setMenteeResponse(initialTask.menteeResponse || '');
        setMentorFeedback(initialTask.mentorFeedback || '');
    }, [initialTask]);

    useEffect(() => {
        if (task) {
            // Set default tab based on status and role
            if (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') {
                setActiveTab('details');
            } else if (task.status === 'SUBMITTED') {
                setActiveTab(canManage ? 'feedback' : 'details');
            } else if (task.status === 'REVIEWED') {
                setActiveTab('feedback');
            }
        }
    }, [task, canManage]);

    if (!task) return null;

    const getTaskStatusConfig = (s: string) => {
        switch (s) {
            case 'ASSIGNED': return { label: 'Asignada', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: Clock };
            case 'IN_PROGRESS': return { label: 'En Progreso', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Activity };
            case 'SUBMITTED': return { label: 'Entregada', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Send };
            case 'REVIEWED': return { label: 'Revisada', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
            default: return { label: s, color: 'text-slate-600', bgColor: 'bg-slate-100', icon: Clock };
        }
    };

    const statusConfig = getTaskStatusConfig(task.status);

    const handleStartTask = async () => {
        setIsSubmitting(true);
        try {
            await mentorshipService.startTask(task.id);
            toast.success('Tarea iniciada');
            // Optimistic/Immediate update
            setTask(prev => ({ ...prev, status: 'IN_PROGRESS' }));
            setActiveTab('resolution');
            mutate();
        } catch (error) {
            toast.error('Error al iniciar tarea');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitTask = async () => {
        if (!menteeResponse.trim()) {
            toast.error('Por favor escribe tu resolución antes de enviar.');
            return;
        }
        setIsSubmitting(true);
        try {
            await mentorshipService.submitTask(task.id, { menteeResponse });
            toast.success('Resolución enviada');
            setTask(prev => ({ ...prev, status: 'SUBMITTED', menteeResponse }));
            mutate();
            setActiveTab('details');
        } catch (error) {
            toast.error('Error al enviar la resolución');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReviewTask = async () => {
        if (!mentorFeedback.trim()) {
            toast.error('Por favor añade un feedback antes de cerrar la tarea.');
            return;
        }
        setIsSubmitting(true);
        try {
            await mentorshipService.reviewTask(task.id, { mentorFeedback });
            toast.success('Tarea revisada y cerrada');
            setTask(prev => ({ ...prev, status: 'REVIEWED', mentorFeedback }));
            mutate();
            setActiveTab('feedback');
        } catch (error) {
            toast.error('Error al revisar la tarea');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 py-5 bg-slate-50/50 border-b relative">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${statusConfig.bgColor}`}>
                            <statusConfig.icon className={`w-5 h-5 ${statusConfig.color}`} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900">{task.title}</DialogTitle>
                            <DialogDescription className="text-xs font-medium flex items-center gap-2 mt-0.5">
                                <span className={statusConfig.color}>{statusConfig.label}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500">
                                    {task.isGroupTask ? 'Tarea Grupal' : `Asignada a ${getPersonName(task.assignedChurchPersonId || '')}`}
                                </span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 bg-slate-50/30 border-b">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-8 rounded-none border-none p-0">
                            <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 text-sm font-bold opacity-60 data-[state=active]:opacity-100 transition-all">
                                Detalle de Tarea
                            </TabsTrigger>
                            <TabsTrigger value="resolution" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 text-sm font-bold opacity-60 data-[state=active]:opacity-100 transition-all">
                                Resolución
                            </TabsTrigger>
                            <TabsTrigger value="feedback" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12 text-sm font-bold opacity-60 data-[state=active]:opacity-100 transition-all">
                                Feedback
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/20">
                        <TabsContent value="details" className="m-0 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {task.description && (
                                <section>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Descripción General</h4>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {task.description}
                                    </div>
                                </section>
                            )}

                            {task.mentorInstruction && (
                                <section>
                                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 px-1">Instrucciones del Mentor</h4>
                                    <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/50 text-indigo-900 leading-relaxed whitespace-pre-wrap font-medium">
                                        {task.mentorInstruction}
                                    </div>
                                </section>
                            )}

                            <section className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500 mt-4">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-medium">Entrega:</span> {task.dueDate ? format(new Date(task.dueDate), "d 'de' MMMM", { locale: es }) : 'Sin fecha límite'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-medium">Responsable:</span> {task.assignedChurchPersonId ? getPersonName(task.assignedChurchPersonId) : 'Todos'}
                                </div>
                                {task.meetingId && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-medium">Asociada a un encuentro</span>
                                    </div>
                                )}
                            </section>
                        </TabsContent>

                        <TabsContent value="resolution" className="m-0 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {isMentee && task.status === 'ASSIGNED' && (
                                <div className="flex flex-col gap-2 p-6 bg-slate-100/50 rounded-2xl border border-slate-200">
                                    <div className="text-slate-600 font-medium">Esta tarea aún no ha sido iniciada.</div>
                                    <div className="text-xs text-slate-400">Presiona el botón "Iniciar Tarea" para comenzar a trabajar.</div>
                                </div>
                            )}

                            {isMentee && task.status === 'IN_PROGRESS' && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest px-1 flex justify-between items-center">
                                        Modo Edición: Escribe tu resolución
                                        <span className="text-slate-300 font-normal normal-case">Tu progreso se guardará al enviar</span>
                                    </h4>
                                    <Textarea
                                        value={menteeResponse}
                                        onChange={(e) => setMenteeResponse(e.target.value)}
                                        placeholder="Escribe aquí los resultados de tu tarea..."
                                        className="min-h-[350px] bg-white border-primary/20 focus-visible:ring-primary shadow-inner p-6 text-base leading-relaxed resize-none rounded-2xl"
                                        autoFocus
                                    />
                                </div>
                            )}

                            {(task.status === 'SUBMITTED' || task.status === 'REVIEWED' || (!isMentee && task.status === 'IN_PROGRESS')) && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Resolución del Guiado</h4>
                                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-slate-800 text-lg leading-relaxed whitespace-pre-wrap font-serif italic border-l-4 border-l-primary/30">
                                        {task.menteeResponse || <span className="text-slate-300 italic">No se ha registrado una respuesta aún.</span>}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="feedback" className="m-0 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {canManage && (task.status === 'SUBMITTED' || task.status === 'REVIEWED') && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-1">Modo Mentor: Feedback Final</h4>
                                    <Textarea
                                        value={mentorFeedback}
                                        onChange={(e) => setMentorFeedback(e.target.value)}
                                        placeholder="Escribe tus observaciones y feedback aquí..."
                                        className="min-h-[300px] bg-white border-indigo-200 focus-visible:ring-indigo-500 shadow-inner p-6 text-base leading-relaxed resize-none rounded-2xl"
                                    />
                                </div>
                            )}

                            {!canManage && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Feedback del Mentor</h4>
                                    <div className="bg-indigo-50/20 p-8 rounded-2xl border border-indigo-100 shadow-sm text-indigo-900 text-lg leading-relaxed whitespace-pre-wrap italic">
                                        {task.mentorFeedback || <span className="text-slate-300 font-normal">Aún no se ha proporcionado feedback.</span>}
                                    </div>
                                </div>
                            )}

                            {canManage && task.status !== 'SUBMITTED' && task.status !== 'REVIEWED' && (
                                <div className="p-6 bg-slate-100/50 rounded-2xl border border-slate-200 text-center">
                                    <div className="text-slate-500 font-medium">El feedback estará disponible una vez que el guiado envíe su resolución.</div>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="px-6 py-5 bg-slate-50 border-t flex flex-wrap gap-3 sm:justify-between items-center sm:gap-0">
                    <div className="flex gap-2">
                        {canManage && onEdit && (
                            <Button variant="outline" size="sm" className="h-9 px-4 font-bold text-slate-600 border-slate-200 hover:bg-slate-100 rounded-xl" onClick={() => onEdit(task)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar Definición
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {isMentee && task.status === 'ASSIGNED' && (
                            <Button size="sm" className="h-9 px-6 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl" onClick={handleStartTask} disabled={isSubmitting}>
                                {isSubmitting ? 'Iniciando...' : 'Iniciar Tarea'}
                            </Button>
                        )}
                        {isMentee && task.status === 'IN_PROGRESS' && (
                            <Button size="sm" className="h-9 px-6 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl" onClick={handleSubmitTask} disabled={isSubmitting}>
                                {isSubmitting ? 'Enviando...' : 'Enviar Resolución'}
                            </Button>
                        )}
                        {canManage && task.status === 'SUBMITTED' && (
                            <Button size="sm" className="h-9 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-xl" onClick={handleReviewTask} disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : 'Cerrar con Feedback'}
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-9 px-4 font-bold text-slate-500 hover:text-slate-800 rounded-xl" onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
