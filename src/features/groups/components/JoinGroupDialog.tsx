import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FamilyDto } from '@/features/families/types/family.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGroupMutations } from '../hooks/useGroupMutations';

interface JoinGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    family: FamilyDto;
    groupId: string;
    currentMemberId: string;
    onSuccess: () => void;
}

export function JoinGroupDialog({ open, onOpenChange, family, groupId, currentMemberId, onSuccess }: JoinGroupDialogProps) {
    // Default selection is just the current user
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set([currentMemberId]));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addParticipant } = useGroupMutations();

    const handleToggle = (memberId: string) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(memberId)) {
            newSelected.delete(memberId);
        } else {
            newSelected.add(memberId);
        }
        setSelectedMembers(newSelected);
    };

    const handleJoin = async () => {
        if (selectedMembers.size === 0) {
            toast.error('Debes seleccionar al menos un miembro para inscribir.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Enroll each selected person sequentially to avoid potential race conditions if backend requires it
            for (const memberId of Array.from(selectedMembers)) {
                await addParticipant(groupId, memberId, 'MEMBER');
            }
            toast.success(`Inscripción completada exitosamente`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            // toast.error is already handled inside useGroupMutations, but we can catch logic flaws here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl border-b pb-4">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Inscripción Familiar
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-slate-600">
                        Selecciona a los miembros de tu familia que deseas inscribir en este grupo o curso.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {family.members.map((fm) => {
                        if (!fm.member?.person) return null;

                        const personId = fm.member.id;
                        const isSelected = selectedMembers.has(personId);

                        return (
                            <div
                                key={fm.id}
                                className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                onClick={() => handleToggle(personId)}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => handleToggle(personId)}
                                    // Stop propagation so clicking the checkbox itself works intuitively
                                    onClick={e => e.stopPropagation()}
                                />
                                <Avatar className="h-10 w-10 border border-slate-200">
                                    <AvatarImage src={fm.member.person.profileImage} />
                                    <AvatarFallback className="bg-white text-slate-700 font-bold">
                                        {fm.member.person.firstName?.[0] || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-800 text-sm">
                                        {fm.member.person.fullName}
                                    </span>
                                    <span className="text-xs text-slate-500 capitalize">
                                        {fm.role === 'FATHER' ? 'Padre' :
                                            fm.role === 'MOTHER' ? 'Madre' :
                                                fm.role === 'SPOUSE' ? 'Cónyuge' :
                                                    fm.role === 'CHILD' ? 'Hijo/a' : 'Familiar'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleJoin} disabled={isSubmitting || selectedMembers.size === 0} className="bg-indigo-600 hover:bg-indigo-700">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Inscribiendo...
                            </>
                        ) : (
                            `Inscribir ${selectedMembers.size} persona${selectedMembers.size !== 1 ? 's' : ''}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
