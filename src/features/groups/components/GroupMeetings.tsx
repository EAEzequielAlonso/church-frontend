import React, { useState } from 'react';
import { GroupMeetingDto, GroupType, CreateMeetingDto } from '../types/group.types';
import { getGroupTypeConfig } from '../config/group-type.config';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, MapPin, ClipboardList, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GroupAttendance } from './GroupAttendance';
import { UniversalMeetingCard } from '@/components/shared/UniversalMeetingCard';
import { CreateEventDialog } from '@/app/(dashboard)/agenda/create-event-dialog';
import { CalendarEventType, EVENT_TYPE_COLORS } from '@/types/agenda';
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

    const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [meetingToEdit, setMeetingToEdit] = useState<any>(null);

    const sortedMeetings = [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleDeleteMeeting = async (meetingId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este encuentro?')) return;
        try {
            await groupsApi.deleteMeeting(groupId, meetingId);
            toast.success('Encuentro eliminado');
            refetch();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar el encuentro');
        }
    };

    const handleEditMeeting = (meeting: any) => {
        const calType = 
            groupType === 'COURSE' ? CalendarEventType.COURSE :
            groupType === 'ACTIVITY' ? CalendarEventType.ACTIVITY :
            groupType === 'DISCIPLESHIP' ? CalendarEventType.DISCIPLESHIP :
            groupType === 'MINISTRY_TEAM' ? CalendarEventType.MINISTRY : CalendarEventType.SMALL_GROUP;

        // Transform GroupMeetingDto to the format expected by CreateEventDialog
        const eventToEdit = {
            id: meeting.id,
            title: format(new Date(meeting.date), "EEEE d 'de' MMMM, yyyy", { locale: es }),
            description: meeting.notes || '',
            location: meeting.location || '',
            startDate: meeting.date,
            endDate: new Date(new Date(meeting.date).getTime() + 60 * 60 * 1000).toISOString(),
            type: calType,
            color: EVENT_TYPE_COLORS[calType],
            isAllDay: false,
            ownerId: groupId
        };
        setMeetingToEdit(eventToEdit);
    };

    const handleUpdateMeeting = async (data: any) => {
        if (!meetingToEdit) return;
        try {
            await groupsApi.updateMeeting(groupId, meetingToEdit.id, {
                date: data.startDate,
                location: data.location || undefined,
                notes: data.description || undefined,
            });
            setMeetingToEdit(null);
            refetch();
        } catch (error) {
            console.error(error);
            throw new Error('No se pudo actualizar el encuentro.');
        }
    };

    const handleCreateMeeting = async (data: any) => {
        setIsCreating(true);
        try {
            const payload: CreateMeetingDto = {
                date: data.startDate, // CreateEventDialog provides ISO strings
                location: data.location || undefined,
                notes: data.description || undefined,
            };
            await groupsApi.createMeeting(groupId, payload);
            refetch();
        } catch (error) {
            console.error(error);
            throw new Error('No se pudo registrar el encuentro.');
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
                    <CreateEventDialog 
                        onEventCreated={refetch}
                        onSubmitOverride={handleCreateMeeting}
                        defaultType={
                            groupType === 'COURSE' ? CalendarEventType.COURSE :
                            groupType === 'ACTIVITY' ? CalendarEventType.ACTIVITY :
                            groupType === 'DISCIPLESHIP' ? CalendarEventType.DISCIPLESHIP :
                            groupType === 'MINISTRY_TEAM' ? CalendarEventType.MINISTRY : CalendarEventType.SMALL_GROUP
                        }
                        defaultEntityId={groupId}
                        trigger={
                            <Button size="sm" className="shadow-sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Encuentro
                            </Button>
                        }
                    />
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
                        <UniversalMeetingCard
                            key={meeting.id}
                            id={meeting.id}
                            date={meeting.date}
                            title={format(new Date(meeting.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                            timeLabel={format(new Date(meeting.date), "HH:mm")}
                            location={meeting.location || 'Ubicación no especificada'}
                            description={meeting.notes}
                            attendeeCount={meeting.attendances?.length || 0}
                            isPast={new Date(meeting.date) < new Date()}
                            type={
                                groupType === 'COURSE' ? CalendarEventType.COURSE :
                                groupType === 'ACTIVITY' ? CalendarEventType.ACTIVITY :
                                groupType === 'DISCIPLESHIP' ? CalendarEventType.DISCIPLESHIP :
                                groupType === 'MINISTRY_TEAM' ? CalendarEventType.MINISTRY : CalendarEventType.SMALL_GROUP
                            }
                            onEdit={isAdminOrAuditor ? () => handleEditMeeting(meeting) : undefined}
                            onDelete={isAdminOrAuditor ? () => handleDeleteMeeting(meeting.id) : undefined}
                            actions={
                                (isAdminOrAuditor || isEnrolled) ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full font-bold"
                                        onClick={() => setSelectedMeetingId(meeting.id)}
                                    >
                                        <ClipboardList className="w-4 h-4 mr-2" />
                                        Asistencia
                                    </Button>
                                ) : undefined
                            }
                        />
                    ))}
                </div>
            )}

            {isAdminOrAuditor && meetingToEdit && (
                <CreateEventDialog 
                    onEventCreated={() => { setMeetingToEdit(null); refetch(); }}
                    onSubmitOverride={handleUpdateMeeting}
                    eventToEdit={meetingToEdit}
                    open={!!meetingToEdit}
                    onOpenChange={(open) => !open && setMeetingToEdit(null)}
                />
            )}
        </div>
    );
}
