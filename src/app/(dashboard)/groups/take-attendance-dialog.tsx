'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SmallGroupMember, SmallGroupGuest } from '@/types/small-group';
import { CalendarEvent } from '@/types/agenda';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone } from 'lucide-react';

interface TakeAttendanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: CalendarEvent;
    members: SmallGroupMember[];
    guests: SmallGroupGuest[];
    onSuccess: () => void;
}

export function TakeAttendanceDialog({ open, onOpenChange, event, members, guests, onSuccess }: TakeAttendanceDialogProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Sync state when event changes or dialog opens
    useEffect(() => {
        if (open && event.attendees) {
            const initialIds: string[] = [];

            // 1. Add Members (Attendees matched by Person ID)
            // (Members usually have their Person ID same as loaded if they are ChurchMembers)
            // But we iterate 'members' list to check against attendees. 
            // Correction: The backend `markAttendance` accepts ANY ID.
            // If we send `member.person.id`, that's good.
            // If we send `guest.id`, that's good.

            // We need to construct the list of "Source IDs" that result in these "Person IDs".

            const attendeeIds = new Set(event.attendees.map(a => a.id));

            // Check Members
            members.forEach(m => {
                if (m.member.person?.id && attendeeIds.has(m.member.person.id)) {
                    initialIds.push(m.member.person.id);
                }
            });

            // Check Guests
            guests.forEach(g => {
                const personId = g.followUpPerson?.personInvited?.person?.id || g.personInvited?.person?.id;
                if (personId && attendeeIds.has(personId)) {
                    initialIds.push(g.id); // Push the GUEST ID, so the checkbox (which uses g.id) is checked.
                }
            });

            setSelectedIds(initialIds);
        } else if (!open) {
            setSelectedIds([]);
        }
    }, [open, event.attendees, event.id, members, guests]);

    const toggleMember = (personId: string) => {
        setSelectedIds(prev =>
            prev.includes(personId)
                ? prev.filter(id => id !== personId)
                : [...prev, personId]
        );
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/events/${event.id}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ personIds: selectedIds })
            });

            if (!res.ok) throw new Error('Error al guardar asistencia');

            toast.success('Asistencia guardada');
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            toast.error('Ocurrió un error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Tomar Asistencia</DialogTitle>
                    <p className="text-sm text-slate-500">
                        {event.title} - {new Date(event.startDate).toLocaleDateString()}
                    </p>
                </DialogHeader>

                <div className="py-4 space-y-6 max-h-[400px] overflow-y-auto pr-2">
                    {/* Miembros de la Iglesia */}
                    {members.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Miembros</h4>
                            <div className="space-y-1">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                        <Checkbox
                                            id={`member-${member.id}`}
                                            checked={member.member.person ? selectedIds.includes(member.member.person.id || '') : false}
                                            onCheckedChange={() => member.member.person && toggleMember(member.member.person.id!)}
                                        />
                                        <div className="flex-grow min-w-0">
                                            <Label htmlFor={`member-${member.id}`} className="cursor-pointer font-medium text-slate-900 block truncate">
                                                {member.member.person?.firstName} {member.member.person?.lastName}
                                            </Label>
                                            <div className="flex gap-2 text-[10px] text-slate-400">
                                                <span>Miembro</span>
                                                {member.role === 'MODERATOR' && <span className="text-violet-500 font-bold">Encargado</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Visitantes e Invitados */}
                    {guests.length > 0 && (
                        <div className="space-y-2 border-t pt-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Visitantes e Invitados</h4>
                            <div className="space-y-1">
                                {guests.map(guest => {
                                    // The ID we send to the backend for marking attendance needs to be something the backend understands.
                                    // The backend `markAttendance` logic checks: Person ID -> FollowUpPerson ID -> PersonInvited ID -> SmallGroupGuest ID.
                                    // So sending `guest.id` is safe and preferred for guests/visitors to ensure mapping.
                                    const sendId = guest.id;

                                    // Resolve the "Actual Person ID" if it exists, to check against event.attendees
                                    const resolvedPersonId = guest.followUpPerson?.personInvited?.person?.id || guest.personInvited?.person?.id;

                                    // Check if this guest is considered "Present" (in event.attendees)
                                    // If we toggled it locally (in selectedIds), that takes precedence.

                                    // Problem: validation logic vs "what to send".
                                    // Strategy:
                                    // 1. If present in `event.attendees`, their PERSON ID is there. 
                                    // 2. We want to operate on a list of IDs to SEND. 
                                    //    - If already present, we should add their `sendId` (Guest ID) to `selectedIds` initially?
                                    //    - OR we map everything to Person IDs? No, because new guests don't have Person IDs yet.

                                    // REVISED STRATEGY: 
                                    // `selectedIds` will verify against: 
                                    // - `sendId` (if explicitly toggled)
                                    // - `resolvedPersonId` (if loaded from backend as attendee)

                                    // But `toggleMember` toggles `sendId`. 
                                    // So we need to Initialize `selectedIds` differently. (See useEffect change below/above or handled here).
                                    // Actually, let's fix the isChecked logic:

                                    const isPresentInBackend = event.attendees?.some(att => att.id === resolvedPersonId);

                                    // If we have selected/unselected this SPECIFIC guest ID, respect that.
                                    // But how do we know if we UNSELECTED a backend person?
                                    // The `selectedIds` state is "List of IDs to SAVE".
                                    // So it should contain EVERYONE who is present.

                                    // We need to initialize `selectedIds` with `guest.id` if `resolvedPersonId` is in `event.attendees`.
                                    // This requires a `useEffect` update, but we can also just handle it purely via `selectedIds` if we init correctly.

                                    const isChecked = selectedIds.includes(sendId);

                                    return (
                                        <div key={guest.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <Checkbox
                                                id={`guest-${guest.id}`}
                                                checked={isChecked}
                                                onCheckedChange={() => toggleMember(sendId)}
                                            />
                                            <div className="flex-grow min-w-0">
                                                <Label htmlFor={`guest-${guest.id}`} className="cursor-pointer font-medium text-slate-900 block truncate">
                                                    {guest.fullName}
                                                </Label>
                                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                                                    <Badge variant="secondary" className={`text-[9px] h-4 px-1 ${guest.followUpPerson ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {guest.followUpPerson ? 'VISITANTE' : 'INVITADO'}
                                                    </Badge>
                                                    {(guest.email || guest.phone) && (
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                            {guest.email && <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {guest.email}</span>}
                                                            {guest.phone && <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {guest.phone}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Cancelar</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                        {isLoading ? 'Guardando...' : 'Guardar Asistencia'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
