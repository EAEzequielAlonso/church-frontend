import React, { useState } from 'react';
import { GroupMeetingDto, GroupType, CreateMeetingDto } from '../types/group.types';
import { getGroupTypeConfig } from '../config/group-type.config';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, MapPin, ClipboardList, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GroupAttendance } from './GroupAttendance';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { groupsApi } from '../api/groups.api';
import { toast } from 'sonner';

interface GroupMeetingsProps {
    meetings: GroupMeetingDto[];
    groupId: string;
    isAdminOrAuditor: boolean;
    isEnrolled: boolean;
    refetch: () => void;
    groupType: GroupType;
}

export function GroupMeetings({ meetings, groupId, isAdminOrAuditor, isEnrolled, refetch, groupType }: GroupMeetingsProps) {
    const config = getGroupTypeConfig(groupType);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

    // New Meeting Dialog state
    const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingLocation, setMeetingLocation] = useState('');
    const [meetingNotes, setMeetingNotes] = useState('');

    const sortedMeetings = [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleCreateMeeting = async () => {
        if (!meetingDate) {
            toast.error('La fecha del encuentro es obligatoria.');
            return;
        }
        setIsCreating(true);
        try {
            const payload: CreateMeetingDto = {
                date: new Date(meetingDate).toISOString(),
                location: meetingLocation || undefined,
                notes: meetingNotes || undefined,
            };
            await groupsApi.createMeeting(groupId, payload);
            toast.success('Encuentro registrado correctamente.');
            setIsNewMeetingOpen(false);
            setMeetingDate('');
            setMeetingLocation('');
            setMeetingNotes('');
            refetch();
        } catch (error) {
            toast.error('No se pudo registrar el encuentro.');
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    if (selectedMeetingId) {
        return (
            <GroupAttendance
                meetingId={selectedMeetingId}
                groupId={groupId}
                onBack={() => { setSelectedMeetingId(null); refetch(); }}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-100 text-slate-700`}>
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Encuentros y Reuniones</h3>
                        <p className="text-sm text-slate-500">Historial y toma de asistencia.</p>
                    </div>
                </div>

                {isAdminOrAuditor && (
                    <Button size="sm" className="shadow-sm" onClick={() => setIsNewMeetingOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Encuentro
                    </Button>
                )}
            </div>

            {meetings.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No hay reuniones registradas</h3>
                    <p className="text-slate-500">Comienza registrando el primer encuentro de este grupo.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedMeetings.map(meeting => (
                        <div key={meeting.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-slate-800 capitalize">
                                        {format(new Date(meeting.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                    </h4>
                                    <div className="flex items-center text-sm text-slate-500 mt-1">
                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                        {meeting.location || 'Ubicación no especificada'}
                                    </div>
                                </div>
                                <div className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                                    {meeting.attendances?.length || 0} asistencias
                                </div>
                            </div>

                            {meeting.notes && (
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
                                    {meeting.notes}
                                </p>
                            )}

                            {(isAdminOrAuditor || isEnrolled) && (
                                <Button
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => setSelectedMeetingId(meeting.id)}
                                >
                                    <ClipboardList className="w-4 h-4 mr-2" />
                                    Gestionar Asistencia
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* New Meeting Dialog */}
            <Dialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            Registrar Nuevo Encuentro
                        </DialogTitle>
                        <DialogDescription>
                            Ingresá la fecha y opcionalmente la ubicación y notas del encuentro.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="grid gap-2">
                            <Label htmlFor="meeting-date">Fecha del Encuentro <span className="text-red-500">*</span></Label>
                            <Input
                                id="meeting-date"
                                type="datetime-local"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="meeting-location">Ubicación</Label>
                            <Input
                                id="meeting-location"
                                placeholder="Ej: Salón principal, Zoom..."
                                value={meetingLocation}
                                onChange={(e) => setMeetingLocation(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="meeting-notes">Notas</Label>
                            <Textarea
                                id="meeting-notes"
                                placeholder="Tema tratado, observaciones..."
                                rows={3}
                                value={meetingNotes}
                                onChange={(e) => setMeetingNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setIsNewMeetingOpen(false)} disabled={isCreating}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateMeeting} disabled={isCreating || !meetingDate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : 'Guardar Encuentro'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
