"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface JoinFamilyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    activityId: string;
    onSuccess: () => void;
}

export function JoinFamilyDialog({ isOpen, onClose, activityId, onSuccess }: JoinFamilyDialogProps) {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [familyName, setFamilyName] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchFamily();
        }
    }, [isOpen]);

    const fetchFamily = async () => {
        setLoading(true);
        try {
            const res = await api.get('/families/my-family');
            if (res.data) {
                setFamilyName(res.data.name);
                // Map members to a format we can use
                // Response structure: { id, name, members: [ { member: { id, person: { firstName, lastName } }, role } ] }
                const members = res.data.members.map((m: any) => ({
                    id: m.member.id,
                    name: `${m.member.person.firstName} ${m.member.person.lastName}`,
                    role: m.role
                }));
                setFamilyMembers(members);
                // Default select all? Or just self?
                // Let's select all by default for convenience in "Family Join" context, or let user choose.
                // User requirement: "pueda seleccionar a quien de su grupo familiar anota"
                // Let's initially select NONE or maybe SELF?
                // We don't verify 'self' id here easily without auth context, but usually the user wants to join too.
                // Let's verify who is already enrolled? The API `join` handles "already_joined".
                // We'll leave empty or select all. Let's select ALL for now as "Me Sumo" implies I am initiating.
                setSelectedMembers(members.map((m: any) => m.id));
            }
        } catch (error) {
            console.error('Error fetching family:', error);
            toast.error('No se pudo cargar la información familiar');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedMembers.length === 0) {
            toast.error('Selecciona al menos un miembro');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/courses/${activityId}/join`, {
                memberIds: selectedMembers
            });
            toast.success('Inscripción realizada con éxito');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error joining activity:', error);
            // Handle specific error messages from backend
            const msg = error.response?.data?.message || 'Error al inscribirse';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleMember = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Inscribir a la Familia - {familyName}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Selecciona los miembros de tu familia que asistirán a esta actividad:
                            </p>
                            {familyMembers.map((member) => (
                                <div key={member.id} className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                    <Checkbox
                                        id={member.id}
                                        checked={selectedMembers.includes(member.id)}
                                        onCheckedChange={() => toggleMember(member.id)}
                                    />
                                    <Label htmlFor={member.id} className="flex-1 cursor-pointer font-medium">
                                        {member.name}
                                        {/* <span className="text-xs text-muted-foreground ml-2">({member.role})</span> */}
                                    </Label>
                                </div>
                            ))}
                            {familyMembers.length === 0 && (
                                <p className="text-center text-muted-foreground">No se encontraron miembros familiares.</p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || selectedMembers.length === 0}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Inscripción
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
