import React, { useState } from 'react';
import { GroupMeetingDto, GroupType } from '../types/group.types';
import { getGroupTypeConfig } from '../config/group-type.config';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, MapPin, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GroupAttendance } from './GroupAttendance';

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

    const sortedMeetings = [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                    <Button size="sm" className="shadow-sm">
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
        </div>
    );
}
