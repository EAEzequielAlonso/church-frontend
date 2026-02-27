'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Lock, Globe, Eye, Loader2, Calendar, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DiscipleshipNoteType, DiscipleshipRole } from '@/types/discipleship';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NotesTab({ discipleship, refresh, myRole, userId }: any) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [filterMeetingId, setFilterMeetingId] = useState<string>('all');

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            title: '',
            content: '',
            type: DiscipleshipNoteType.PRIVATE,
            meetingId: null
        }
    });

    const noteType = watch('type');
    const isDisciple = myRole === DiscipleshipRole.DISCIPLE;

    const onAddNote = async (data: any) => {
        setIsLoading(true);
        try {
            await api.post(`/discipleships/${discipleship.id}/notes`, {
                title: data.title,
                content: data.content,
                type: data.type,
                meetingId: data.meetingId // Can be null
            });
            toast.success('Nota guardada');
            setIsDialogOpen(false);
            reset({ title: '', content: '', type: isDisciple ? DiscipleshipNoteType.PRIVATE : DiscipleshipNoteType.PRIVATE, meetingId: null });
            refresh();
        } catch (error) {
            toast.error('Error al guardar nota');
        } finally {
            setIsLoading(false);
        }
    };

    const allNotes = discipleship.notes?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

    const filteredNotes = filterMeetingId === 'all'
        ? allNotes
        : allNotes.filter((n: any) => n.meeting?.id === filterMeetingId);

    const getVisibilityIcon = (type: string) => {
        switch (type) {
            case DiscipleshipNoteType.PRIVATE: return <Lock className="w-3 h-3" />;
            case DiscipleshipNoteType.SHARED: return <Globe className="w-3 h-3" />;
            case DiscipleshipNoteType.SUPERVISION: return <Eye className="w-3 h-3" />;
            default: return <Lock className="w-3 h-3" />;
        }
    };

    const getVisibilityLabel = (type: string) => {
        switch (type) {
            case DiscipleshipNoteType.PRIVATE: return 'Privada';
            case DiscipleshipNoteType.SHARED: return 'Compartida';
            case DiscipleshipNoteType.SUPERVISION: return 'Supervisión';
            default: return 'Privada';
        }
    };

    const getVisibilityColor = (type: string) => {
        switch (type) {
            case DiscipleshipNoteType.PRIVATE: return 'bg-gray-100 text-gray-700 border-gray-200';
            case DiscipleshipNoteType.SHARED: return 'bg-blue-50 text-blue-700 border-blue-200';
            case DiscipleshipNoteType.SUPERVISION: return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">Bitácora y Notas</h3>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <Select value={filterMeetingId} onValueChange={setFilterMeetingId}>
                            <SelectTrigger className="h-8 w-[200px] text-xs">
                                <SelectValue placeholder="Filtrar por encuentro" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las notas</SelectItem>
                                {(discipleship.meetings || []).map((m: any) => (
                                    <SelectItem key={m.id} value={m.id}>
                                        Encuentro {format(new Date(m.date), "dd/MM")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Nota
                </Button>
            </div>

            {filteredNotes.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg bg-gray-50">
                    <p className="text-gray-500">No hay notas para mostrar.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredNotes.map((note: any) => (
                        <Card key={note.id} className="overflow-hidden">
                            <div className={`h-1 w-full ${note.type === DiscipleshipNoteType.SHARED ? 'bg-blue-400' :
                                note.type === DiscipleshipNoteType.SUPERVISION ? 'bg-amber-400' : 'bg-gray-300'
                                }`} />
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className={`flex items-center gap-1 ${getVisibilityColor(note.type)}`}>
                                            {getVisibilityIcon(note.type)}
                                            {getVisibilityLabel(note.type)}
                                        </Badge>
                                        <span className="text-xs text-gray-400">
                                            {format(new Date(note.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                                        </span>
                                        {note.meeting && (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Encuentro {format(new Date(note.meeting.date), "dd/MM")}
                                            </Badge>
                                        )}
                                    </div>
                                    {note.author?.id === userId ? (
                                        <div className="text-xs text-gray-400">Tú</div>
                                    ) : (
                                        <div className="text-xs font-semibold text-gray-600">{note.author?.person?.fullName}</div>
                                    )}
                                </div>

                                {note.title && <h4 className="text-sm font-bold text-slate-800 mb-1">{note.title}</h4>}

                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {note.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Nota</DialogTitle>
                        <DialogDescription>Registra observaciones, avances o peticiones.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onAddNote)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Encuentro Relacionado (Opcional)</Label>
                            <Select onValueChange={(val) => setValue('meetingId', (val === 'none' ? null : val) as any)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin asociar a encuentro" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sin asociar</SelectItem>
                                    {(discipleship.meetings || []).map((m: any) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {format(new Date(m.date), "dd/MM/yyyy", { locale: es })} - {m.summary ? m.summary.substring(0, 20) + '...' : 'Encuentro'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Visibilidad</Label>
                            <Select
                                value={noteType}
                                onValueChange={(val: any) => setValue('type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={DiscipleshipNoteType.PRIVATE}>
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-gray-500" />
                                            <span>Privada (Solo yo)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={DiscipleshipNoteType.SHARED}>
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-500" />
                                            <span>Compartida (Todos)</span>
                                        </div>
                                    </SelectItem>
                                    {!isDisciple && (
                                        <SelectItem value={DiscipleshipNoteType.SUPERVISION}>
                                            <div className="flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-amber-500" />
                                                <span>Supervisión (Oculta al discípulo)</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Título (Opcional)</Label>
                            <Input {...register('title')} placeholder="Asunto de la nota..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Contenido</Label>
                            <Textarea
                                {...register('content', { required: true })}
                                placeholder="Escribe tu nota aquí..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Guardar Nota
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
