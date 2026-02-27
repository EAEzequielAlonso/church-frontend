'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, User, CheckCircle, RotateCcw, Trash2, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import useSWR from 'swr';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function MinistrySchedulePage() {
    const { id: ministryId } = useParams();
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const [selectedWeekday, setSelectedWeekday] = useState<string>('0'); // Default Sunday
    const [selectedCell, setSelectedCell] = useState<{ date: Date, roleId: string, currentAssignment?: any } | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

    // Form State for Metadata
    const [metaTitle, setMetaTitle] = useState('');
    const [metaPassage, setMetaPassage] = useState('');
    const [metaSongsBefore, setMetaSongsBefore] = useState('');
    const [metaSongsAfter, setMetaSongsAfter] = useState('');
    const [metaAnnouncements, setMetaAnnouncements] = useState('');

    // Fetch Data
    const { data: ministry } = useSWR(`/ministries/${ministryId}`, url => api.get(url).then(r => r.data));
    const { data: duties } = useSWR(`/ministries/${ministryId}/duties`, url => api.get(url).then(r => r.data));

    // Dates range for current month view (or similar)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const { data: assignments, mutate: refreshAssignments } = useSWR(
        `/ministries/${ministryId}/schedule?from=${format(monthStart, 'yyyy-MM-dd')}&to=${format(monthEnd, 'yyyy-MM-dd')}`,
        url => api.get(url).then(r => r.data)
    );

    const members = ministry?.members || [];

    // Calculate Days based on selector
    const serviceDays = useMemo(() => {
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        return days.filter(day => day.getDay() === parseInt(selectedWeekday));
    }, [currentMonth, selectedWeekday]);

    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

    const getAssignment = (roleId: string, date: Date) => {
        if (!assignments) return null;
        const dateStr = format(date, 'yyyy-MM-dd');
        return assignments.find((a: any) => {
            // Handle both ISO string or YYYY-MM-DD
            const assignDateStr = typeof a.date === 'string' && a.date.includes('T')
                ? a.date.split('T')[0]
                : a.date;

            return a.role.id === roleId && assignDateStr === dateStr;
        });
    };

    const handleCellClick = (roleId: string, date: Date, assignment?: any) => {
        setSelectedCell({ date, roleId, currentAssignment: assignment });

        // Reset Form
        setMetaTitle('');
        setMetaPassage('');
        setMetaSongsBefore('');
        setMetaSongsAfter('');
        setMetaAnnouncements('');

        if (assignment) {
            // Pre-fill if editing
            if (assignment.metadata) {
                setMetaTitle(assignment.metadata.title || '');
                setMetaPassage(assignment.metadata.passage || '');
                setMetaSongsBefore(assignment.metadata.songsBefore || '');
                setMetaSongsAfter(assignment.metadata.songsAfter || '');
                // Handle legacy or specific fields
                if (assignment.metadata.songs) setMetaSongsBefore(assignment.metadata.songs);
            }

            // Preset selected member
            if (assignment.person) {
                const mMember = members.find((m: any) => m.member.person.id === assignment.person.id);
                if (mMember) setSelectedMemberId(mMember.id);
            } else {
                setSelectedMemberId(null);
            }
        } else {
            setSelectedMemberId(null);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        // Use selectedMemberId or fallback to current assignment's person (if just editing metadata)
        let activeMemberId = selectedMemberId;

        // If no new selection, but we have an assignment, verify if we need to keep same person
        if (!activeMemberId && selectedCell?.currentAssignment) {
            const currentPersonId = selectedCell.currentAssignment.person.id;
            const mMember = members.find((m: any) => m.member.person.id === currentPersonId);
            activeMemberId = mMember?.id;
        }

        if (!activeMemberId) {
            toast.error('Debes seleccionar a alguien');
            return;
        }

        const member = members.find((m: any) => m.id === activeMemberId);
        if (!member?.member?.person?.id) return;
        const personId = member.member.person.id;

        // Construct metadata
        const metadata: any = {};
        if (metaTitle) metadata.title = metaTitle;
        if (metaPassage) metadata.passage = metaPassage;
        if (metaSongsBefore) metadata.songsBefore = metaSongsBefore;
        if (metaSongsAfter) metadata.songsAfter = metaSongsAfter;
        if (metaAnnouncements) metadata.title = metaAnnouncements; // Map announcements to title for consistency if that's the convention

        try {
            await api.post(`/ministries/${ministryId}/schedule`, {
                assignments: [{
                    roleId: selectedCell?.roleId,
                    personId: personId,
                    date: format(selectedCell!.date, 'yyyy-MM-dd'),
                    serviceType: 'SUNDAY',
                    metadata
                }]
            });
            toast.success('Guardado correctamente');
            await refreshAssignments();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    const handleDelete = async () => {
        if (!selectedCell?.currentAssignment) return;
        try {
            await api.delete(`/ministries/${ministryId}/schedule/${selectedCell.currentAssignment.id}`);
            toast.success('Asignación eliminada');
            refreshAssignments();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleQuickDelete = async (assignmentId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setAssignmentToDelete(assignmentId);
    };

    const confirmDelete = async () => {
        if (!assignmentToDelete) return;
        try {
            await api.delete(`/ministries/${ministryId}/schedule/${assignmentToDelete}`);
            toast.success('Asignación eliminada');
            refreshAssignments();
        } catch (error) {
            toast.error('Error al eliminar');
        } finally {
            setAssignmentToDelete(null);
        }
    };

    if (!ministry || !duties) return <PageContainer title="Cargando..." description=""><Skeleton className="w-full h-64" /></PageContainer>;

    return (
        <PageContainer
            title={`Cronograma: ${ministry.name}`}
            description="Planificación de servidores para los cultos."
            backButton={true}
        >
            <div className="flex flex-col space-y-6">

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <h2 className="text-xl font-bold capitalize w-48 text-center text-slate-800 flex items-center justify-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            {format(currentMonth, 'MMMM yyyy', { locale: es })}
                        </h2>
                        <Button variant="outline" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500">Ver días:</span>
                        <Select value={selectedWeekday} onValueChange={setSelectedWeekday}>
                            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Día de Servicio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Domingos</SelectItem>
                                <SelectItem value="1">Lunes</SelectItem>
                                <SelectItem value="2">Martes</SelectItem>
                                <SelectItem value="3">Miércoles</SelectItem>
                                <SelectItem value="4">Jueves</SelectItem>
                                <SelectItem value="5">Viernes</SelectItem>
                                <SelectItem value="6">Sábados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Matrix */}
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-left font-semibold text-slate-500 min-w-[200px]">Rol / Fecha</th>
                                {serviceDays.map(day => (
                                    <th key={day.toISOString()} className="p-4 text-center min-w-[150px]">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs uppercase text-slate-400 font-bold">{format(day, 'EEE', { locale: es })}</span>
                                            <span className="text-xl font-bold text-slate-700">{format(day, 'd')}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {duties.length === 0 && (
                                <tr>
                                    <td colSpan={serviceDays.length + 1} className="p-8 text-center text-slate-400">
                                        No hay roles definidos. Ve a la pestaña "Roles" para crear puestos de servicio.
                                    </td>
                                </tr>
                            )}
                            {duties.map((duty: any) => (
                                <tr key={duty.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-700 border-r border-slate-100">
                                        {duty.name}
                                    </td>
                                    {serviceDays.map(day => {
                                        const assignment = getAssignment(duty.id, day);
                                        return (
                                            <td key={day.toISOString()} className="p-2 border-r border-slate-100 last:border-0 relative group">
                                                <button
                                                    onClick={() => handleCellClick(duty.id, day, assignment)}
                                                    className={`w-full h-full min-h-[60px] rounded-lg p-2 text-left transition-all flex items-center gap-3
                                                        ${assignment
                                                            ? 'bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200'
                                                            : 'bg-white hover:bg-slate-50 border border-transparent border-dashed hover:border-slate-300'
                                                        }`}
                                                >
                                                    {assignment ? (
                                                        <>
                                                            <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                                                                <AvatarFallback className="bg-indigo-200 text-indigo-700 text-xs">
                                                                    {assignment.person?.firstName?.[0]}{assignment.person?.lastName?.[0]}
                                                                </AvatarFallback>
                                                                {/* Assuming person has avatarUrl if available */}
                                                            </Avatar>
                                                            <div className="flex flex-col overflow-hidden flex-1">
                                                                <span className="text-sm font-semibold text-indigo-900 truncate w-full">
                                                                    {assignment.person?.firstName}
                                                                </span>
                                                            </div>
                                                            <div
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 rounded-full text-red-400 hover:text-red-600"
                                                                onClick={(e) => handleQuickDelete(assignment.id, e)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Plus className="w-5 h-5 text-slate-300" />
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assignment Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCell?.currentAssignment ? 'Editar Asignación' : 'Asignar Servidor'}
                        </DialogTitle>
                        <div className="text-sm text-slate-500">
                            {selectedCell && format(selectedCell.date, "EEEE d 'de' MMMM", { locale: es })}
                        </div>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Dynamic Metadata Fields */}
                        {(() => {
                            const dutyId = selectedCell?.roleId;
                            const duty = duties.find((d: any) => d.id === dutyId);
                            const behavior = duty?.behaviorType || 'STANDARD';

                            return (
                                <>
                                    {(behavior === 'SPEAKER') && (
                                        <div className="p-3 bg-indigo-50 rounded-lg space-y-3 mb-4 border border-indigo-100">
                                            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest">Contenido</h4>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-indigo-900">Tema / Título</Label>
                                                <Input
                                                    value={metaTitle}
                                                    onChange={(e) => setMetaTitle(e.target.value)}
                                                    placeholder="Ej: La Fe que Mueve Montañas"
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-indigo-900">Pasaje Bíblico</Label>
                                                <Input
                                                    value={metaPassage}
                                                    onChange={(e) => setMetaPassage(e.target.value)}
                                                    placeholder="Ej: Hebreos 11:1-6"
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {behavior === 'ANNOUNCEMENTS' && (
                                        <div className="p-3 bg-amber-50 rounded-lg space-y-3 mb-4 border border-amber-100">
                                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest">Anuncios</h4>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-amber-900">Lista de Anuncios</Label>
                                                <textarea
                                                    value={metaAnnouncements}
                                                    onChange={(e) => setMetaAnnouncements(e.target.value)}
                                                    placeholder="Ej:&#10;- Retiro de Jóvenes ($5000)&#10;- Reunión de Mujeres (Jueves 19hs)"
                                                    className="w-full bg-white min-h-[120px] p-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                                />
                                                <p className="text-[10px] text-amber-700/70">
                                                    Escribe cada anuncio en una nueva línea. Aparecerán listados en el timeline del culto.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {behavior === 'MUSIC_LEADER' && (
                                        <div className="p-3 bg-indigo-50 rounded-lg mb-4 border border-indigo-100">
                                            <p className="text-xs text-indigo-700 italic">
                                                Las canciones se gestionan ahora desde el detalle del culto, en cada sección.
                                            </p>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        <Label>Seleccionar Miembro</Label>
                        <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto border border-slate-100 rounded-xl p-1">
                            {members?.map((m: any) => {
                                const person = m.member?.person;
                                if (!person) return null;
                                const isSelected = selectedMemberId === m.id || (!selectedMemberId && selectedCell?.currentAssignment?.person?.id === person.id);

                                return (
                                    <div
                                        key={m.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'hover:bg-slate-50 border-transparent hover:border-indigo-100'}`}
                                        onClick={() => setSelectedMemberId(m.id)}
                                    >
                                        <Avatar className="w-9 h-9">
                                            <AvatarFallback className="bg-slate-200 text-slate-600">
                                                {person.firstName[0]}{person.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-slate-800">{person.fullName}</p>
                                            <p className="text-xs text-slate-500 capitalize">{m.roleInMinistry?.toLowerCase()}</p>
                                        </div>
                                        {isSelected && <CheckCircle className="w-5 h-5 text-indigo-600 ml-auto" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between items-center w-full">
                        <div className="flex gap-2">
                            {selectedCell?.currentAssignment && (
                                <Button variant="destructive" onClick={handleDelete} type="button">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Liberar
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={!selectedMemberId && !selectedCell?.currentAssignment}>
                                {selectedCell?.currentAssignment ? 'Guardar Cambios' : 'Asignar'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!assignmentToDelete} onOpenChange={(open) => !open && setAssignmentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Quitar rol asignado?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará la asignación de este servidor para la fecha seleccionada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
}
