'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, FileText, CheckCircle, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { programsApi } from '../api/programs.api';
import { ProgramDto, ProgramSessionDto, CreateSessionDto } from '../types/program.types';
import { AttendanceDialog } from '@/components/courses/AttendanceDialog';

interface ProgramSessionListProps {
    program: ProgramDto;
    refresh: () => void;
    canManage?: boolean;
}

export default function ProgramSessionList({ program, refresh, canManage = false }: ProgramSessionListProps) {
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const { register, handleSubmit, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [editingSession, setEditingSession] = useState<ProgramSessionDto | null>(null);

    const onAddSession = async (data: any) => {
        setIsLoading(true);
        try {
            const durationParts = data.durationStr?.split(':') || ['01', '00'];
            const [h, m] = durationParts.map(Number);
            const totalMinutes = (isNaN(h) ? 1 : h) * 60 + (isNaN(m) ? 0 : m);

            const payload: CreateSessionDto = {
                date: data.date,
                startTime: data.startTime,
                estimatedDuration: totalMinutes,
                topic: data.topic,
                notes: data.notes
            };

            if (editingSession) {
                await programsApi.updateSession(editingSession.id, payload);
                toast.success('Sesión actualizada');
            } else {
                await programsApi.createSession(program.id, payload);
                toast.success('Sesión programada');
            }

            setIsDialogOpen(false);
            setEditingSession(null);
            reset();
            refresh();
        } catch (error: any) {
            console.error('Error saving session:', error);
            const msg = error.response?.data?.message || 'Error al guardar sesión';
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSession = (session: ProgramSessionDto) => {
        setEditingSession(session);
        reset({
            topic: session.topic,
            date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
            startTime: session.startTime,
            durationStr: formatDuration(session.estimatedDuration || 60),
            notes: session.notes
        });
        setIsDialogOpen(true);
    };

    const sortedSessions = program.sessions?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

    const isActivity = program.type === 'ACTIVITY';
    const itemLabel = isActivity ? 'Encuentro' : 'Sesión';

    // Permission logic passed via props or handled in parent page generally

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-800">Programa / Cronograma</h3>
                {canManage && (
                    <Button size="sm" onClick={() => setIsDialogOpen(true)} className={isActivity ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isActivity ? 'Agregar Encuentro' : 'Programar Sesión'}
                    </Button>
                )}
            </div>

            {sortedSessions.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg bg-slate-50">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No hay {isActivity ? 'encuentros programados' : 'sesiones programadas'}.</p>
                </div>
            ) : (
                <div className={`relative border-l-2 ml-4 space-y-8 py-4 ${isActivity ? 'border-emerald-200' : 'border-slate-200'}`}>
                    {sortedSessions.map((session, idx) => {
                        const isPast = new Date(session.date) < new Date();
                        return (
                            <div key={session.id} className="relative pl-8">
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${isPast ? 'bg-slate-200 border-slate-300' : (isActivity ? 'bg-white border-emerald-500' : 'bg-white border-indigo-500')}`} />
                                <Card className={`hover:shadow-md transition-shadow ${isPast ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                    <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs font-normal">{itemLabel} {idx + 1}</Badge>
                                                {isPast && <Badge className="bg-slate-200 text-slate-600 hover:bg-slate-300">Realizada</Badge>}
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-lg">{session.topic}</h4>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5 capitalize"><Calendar className="w-3.5 h-3.5" /> {format(new Date(session.date + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {session.startTime.slice(0, 5)} hrs &bull; Duración: {formatDuration(session.estimatedDuration || 60)} hs</span>
                                            </div>
                                            {session.notes && (
                                                <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-md border border-slate-100 flex items-start gap-2">
                                                    <FileText className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
                                                    {session.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-auto flex gap-2">
                                            {canManage && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50"
                                                        onClick={() => handleEditSession(session)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => {
                                                            setSelectedSessionId(session.id);
                                                            setIsAttendanceOpen(true);
                                                        }}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Asistencia
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    setEditingSession(null);
                    reset({});
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSession ? `Editar ${itemLabel}` : `Programar ${itemLabel}`}</DialogTitle>
                        <DialogDescription>
                            {editingSession ? 'Actualiza los datos.' : 'Esto creará automáticamente un evento en el calendario global.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onAddSession)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tema / Objetivo</Label>
                            <Input {...register('topic', { required: true })} placeholder="Ej: Introducción / Reunión Informativa" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input type="date" {...register('date', { required: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Hora de Inicio</Label>
                                <Input type="time" {...register('startTime', { required: true })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Duración (HH:mm)</Label>
                            <Input type="time" {...register('durationStr')} defaultValue="01:00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Notas / Materiales (public)</Label>
                            <Textarea {...register('notes')} placeholder="Detalles adicionales..." />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isLoading} className={isActivity ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"}>
                                {isLoading ? <Clock className="w-4 h-4 animate-spin mr-2" /> : null}
                                {editingSession ? 'Guardar Cambios' : 'Programar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Note: Ideally AttendanceDialog should be moved to features/programs/components too */}
            <AttendanceDialog
                open={isAttendanceOpen}
                onOpenChange={setIsAttendanceOpen}
                sessionId={selectedSessionId}
                courseId={program.id}
            />
        </div>
    );

    function formatDuration(minutes: number) {
        if (!minutes) return '00:00';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
}
