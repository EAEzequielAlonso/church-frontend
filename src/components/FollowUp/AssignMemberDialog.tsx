import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Check, Loader2 } from 'lucide-react';
import { useMembersList } from '@/hooks/useMembersList';
import api from '@/lib/api';
import { toast } from 'sonner';
import { FollowUpPerson } from '@/hooks/useFollowUps';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface AssignMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    followUpId: string;
    currentAssignedId?: string;
    followUpName?: string;
    onSuccess: () => void;
}

export function AssignMemberDialog({ open, onOpenChange, followUpId, currentAssignedId, followUpName, onSuccess }: AssignMemberDialogProps) {
    const [search, setSearch] = useState('');
    const { members, loading } = useMembersList('MEMBER', open, search);
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    // Initial State
    React.useEffect(() => {
        if (open) {
            setSelectedMemberId(currentAssignedId || '');
            setSearch('');
        }
    }, [open, currentAssignedId]);

    const handleAssign = async (memberId: string | null) => {
        if (!followUpId) return;

        setSubmitting(true);
        try {
            await api.patch(`/follow-ups/${followUpId}/assign`, {
                memberId: memberId
            });
            toast.success('Asignación actualizada correctamente');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar la asignación');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle>Asignar Seguimiento</DialogTitle>
                    <DialogDescription>
                        Busca un miembro para asignar a {followUpName || 'este visitante'}.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4">
                    <Command className="rounded-lg border shadow-sm">
                        <CommandInput
                            placeholder="Buscar miembro..."
                            value={search}
                            onValueChange={setSearch}
                            className="border-none focus:ring-0"
                        />
                        <CommandList>
                            {loading && (
                                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                                </div>
                            )}

                            {!loading && members.length === 0 && (
                                <CommandEmpty>No se encontraron miembros.</CommandEmpty>
                            )}

                            {!loading && members.length > 0 && (
                                <CommandGroup heading={search ? "Resultados de búsqueda" : "Sugerencias recientes"}>
                                    <CommandItem
                                        value="unassign"
                                        onSelect={() => handleAssign(null)}
                                        className="text-muted-foreground italic"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                !selectedMemberId ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        -- Sin Asignar --
                                    </CommandItem>

                                    {members.map((member) => (
                                        <CommandItem
                                            key={member.id}
                                            value={`${member.person.firstName} ${member.person.lastName} ${member.id}`.toLowerCase()}
                                            onSelect={() => {
                                                console.log("Selected:", member.id);
                                                handleAssign(member.id);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedMemberId === member.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-[10px]">
                                                        {member.person.firstName[0]}{member.person.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{member.person.firstName} {member.person.lastName}</span>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </div>
            </DialogContent>
        </Dialog>
    );
}
