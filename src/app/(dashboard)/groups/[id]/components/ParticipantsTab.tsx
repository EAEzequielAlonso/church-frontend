import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // If needed for outer buttons
import ParticipantList from '@/components/shared/participants/ParticipantList'; // New Shared Component
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

export function ParticipantsTab({ group, canManage, isFinished, onRemoveMember, onRemoveGuest }: ParticipantsTabProps) {
    // Attendance Calcs (Approximate for mapping)
    const pastEvents = group.events?.filter(e => isPast(new Date(e.startDate)) && !isToday(new Date(e.startDate))) || [];
    const totalEvents = pastEvents.length;

    // TODO: Extract attendance calc logic to a hook or helper if reused elsewhere.

    const mapMember = (m: any) => ({
        id: m.id,
        name: `${m.member.person?.firstName} ${m.member.person?.lastName}`,
        avatarUrl: m.member.person?.avatarUrl,
        email: m.member.person?.email,
        phone: m.member.person?.phoneNumber,
        role: m.role,
        type: 'MEMBER' as const,
        attendedCount: pastEvents.filter(ev => (ev.attendees || []).some((att: any) => att.id === m.member.person?.id)).length,
        totalEvents
    });

    const mapGuest = (g: any, type: 'VISITOR' | 'GUEST') => {
        // Resolve the Shadow Person ID for this guest
        const personId = g.followUpPerson?.personInvited?.person?.id || g.personInvited?.person?.id;

        // Calculate attendance
        const attendedCount = personId
            ? pastEvents.filter(ev => (ev.attendees || []).some((att: any) => att.id === personId)).length
            : 0;

        return {
            id: g.id,
            name: g.fullName,
            email: g.email,
            phone: g.phone,
            type,
            attendedCount,
            totalEvents
        };
    };

    const members = (group.members || []).map(mapMember);
    const visitors = (group.guests?.filter(g => g.followUpPerson) || []).map(g => mapGuest(g, 'VISITOR'));
    const guests = (group.guests?.filter(g => !g.followUpPerson) || []).map(g => mapGuest(g, 'GUEST'));

    const handleRemove = (id: string, type: string) => {
        if (type === 'MEMBER') onRemoveMember(id);
        else onRemoveGuest(id);
    };

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle>Participantes del Grupo</CardTitle>
            </CardHeader>
            <CardContent>
                <ParticipantList
                    members={members}
                    visitors={visitors}
                    guests={guests}
                    canManage={canManage}
                    onRemove={handleRemove}
                // onEditGuest not implemented in Groups tab currently? Or logic exists?
                // Groups tab passed 'onRemove' but not explicitly edit.
                />
            </CardContent>
        </Card>
    );
}
