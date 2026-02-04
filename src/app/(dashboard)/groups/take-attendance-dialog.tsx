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
            setSelectedIds(event.attendees.map(a => a.id));
        } else if (!open) {
            setSelectedIds([]);
        }
    }, [open, event.attendees, event.id]);

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
                                    // The ID we send to the backend for marking attendance
                                    // We can send the Guest Entity ID directly now, as the backend resolves it
                                    const sendId = guest.id;

                                    // To check if they already have attendance recorded, we look for matches
                                    // in the attendees list (which contains Person IDs).
                                    const isChecked = event.attendees?.some(att =>
                                        att.id === guest.followUpPerson?.personInvited?.person?.id ||
                                        att.id === guest.personInvited?.person?.id
                                    );

                                    // We also check selectedIds for the state of the checkboxes during the session
                                    const isCurrentlySelected = selectedIds.includes(sendId) ||
                                        (guest.followUpPerson?.personInvited?.person?.id && selectedIds.includes(guest.followUpPerson.personInvited.person.id)) ||
                                        (guest.personInvited?.person?.id && selectedIds.includes(guest.personInvited.person.id));

                                    return (
                                        <div key={guest.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                            <Checkbox
                                                id={`guest-${guest.id}`}
                                                checked={isCurrentlySelected}
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
