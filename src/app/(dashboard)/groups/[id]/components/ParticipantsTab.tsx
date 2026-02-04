import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ParticipantRow } from './ParticipantRow';
import { SmallGroup } from '@/types/small-group';
import { isPast, isToday } from 'date-fns';

interface ParticipantsTabProps {
    group: SmallGroup;
    canManage: boolean;
    isFinished: boolean;
    onRemoveMember: (id: string) => void;
    onRemoveGuest: (id: string) => void;
    onAddGuestClick: () => void;
    isRemoving: boolean;
}

export function ParticipantsTab({ group, canManage, isFinished, onRemoveMember, onRemoveGuest, onAddGuestClick, isRemoving }: ParticipantsTabProps) {
    // Attendance Calcs
    const pastEvents = group.events?.filter(e => isPast(new Date(e.startDate)) && !isToday(new Date(e.startDate))) || [];
    const totalEvents = pastEvents.length;

    // Categorization
    const members = group.members || [];
    const visitors = group.guests?.filter(g => g.followUpPerson) || [];
    const guests = group.guests?.filter(g => !g.followUpPerson) || [];

    return (
        <div className="space-y-6">
            {/* MEMBERS */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2 bg-slate-50/50">
                    <div className="flex items-center justify-between w-full">
                        <CardTitle className="text-lg font-semibold text-slate-800">Miembros</CardTitle>
                        <Badge variant="outline" className="bg-white">{members.length} Total</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {members.map((member) => (
                            <ParticipantRow
                                key={member.id}
                                name={`${member.member.person?.firstName} ${member.member.person?.lastName}`}
                                photoUrl={member.member.person?.avatarUrl || null}
                                email={member.member.person?.email}
                                phone={member.member.person?.phoneNumber}
                                roleBadge={member.role === 'MODERATOR' ? <Badge className="bg-indigo-600 text-[10px] px-1.5 h-5">LÍDER</Badge> : undefined}
                                roleText={member.role === 'MODERATOR' ? 'Encargado del Grupo' : 'Participante / Miembro'}
                                attendanceProps={{
                                    attendedCount: pastEvents.filter(ev =>
                                        (ev.attendees || []).some((att: any) => att.id === member.member.person?.id)
                                    ).length,
                                    totalEvents
                                }}
                                onRemove={() => onRemoveMember(member.id)}
                                isRemoving={isRemoving}
                                canManage={canManage}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* VISITORS */}
            {visitors.length > 0 && (
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2 bg-slate-50/50">
                        <div className="flex items-center justify-between w-full">
                            <CardTitle className="text-lg font-semibold text-slate-800">Visitantes</CardTitle>
                            <Badge variant="outline" className="bg-white">{visitors.length} Total</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {visitors.map((guest) => (
                                <ParticipantRow
                                    key={guest.id}
                                    name={guest.fullName}
                                    photoUrl={null}
                                    email={guest.email}
                                    phone={guest.phone}
                                    roleBadge={<Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-blue-100 text-blue-700 border-blue-200">VISITANTE</Badge>}
                                    roleText="En seguimiento"
                                    attendanceProps={{
                                        attendedCount: (() => {
                                            const visitorId = guest.followUpPerson?.id;
                                            const personId = guest.followUpPerson?.personInvited?.person?.id;
                                            const invitedId = guest.personInvited?.id;
                                            const guestId = guest.id;

                                            return pastEvents.filter(ev =>
                                                (ev.attendees || []).some((att: any) =>
                                                    att.id === guestId ||
                                                    (visitorId && att.id === visitorId) ||
                                                    (personId && att.id === personId) ||
                                                    (invitedId && att.id === invitedId) ||
                                                    (guest.personInvited?.person?.id && att.id === guest.personInvited.person.id)
                                                )
                                            ).length;
                                        })(),
                                        totalEvents
                                    }}
                                    onRemove={() => onRemoveGuest(guest.id)}
                                    isRemoving={isRemoving}
                                    canManage={canManage}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* GUESTS */}
            <div className="grid gap-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2 bg-slate-50/50">
                        <div className="flex items-center justify-between w-full">
                            <CardTitle className="text-lg font-semibold text-slate-800">Invitados</CardTitle>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-white">{guests.length} Total</Badge>
                                {canManage && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAddGuestClick} disabled={isFinished}>
                                        <Plus className="w-3 h-3 mr-1" />
                                        Agregar Invitado
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {guests.length === 0 && <div className="p-8 text-center text-slate-400">No hay invitados en este grupo.</div>}
                            {guests.map((guest) => (
                                <ParticipantRow
                                    key={guest.id}
                                    name={guest.fullName}
                                    photoUrl={null}
                                    email={guest.email}
                                    phone={guest.phone}
                                    roleBadge={<Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-orange-100 text-orange-700 border-orange-200">INVITADO</Badge>}
                                    roleText="Invitado externo / Amigo"
                                    attendanceProps={{
                                        attendedCount: (() => {
                                            const invitedId = guest.personInvited?.id;
                                            const personId = guest.personInvited?.person?.id;
                                            const guestId = guest.id;

                                            return pastEvents.filter(ev =>
                                                (ev.attendees || []).some((att: any) =>
                                                    att.id === guestId ||
                                                    (invitedId && att.id === invitedId) ||
                                                    (personId && att.id === personId)
                                                )
                                            ).length;
                                        })(),
                                        totalEvents
                                    }}
                                    onRemove={() => onRemoveGuest(guest.id)}
                                    isRemoving={isRemoving}
                                    canManage={canManage}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
