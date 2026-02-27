'use client';

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
import { Check, Loader2, User } from 'lucide-react';
import { useMembersList, MemberOption } from '@/hooks/useMembersList';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface MemberSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (member: MemberOption) => void;
    title?: string;
    description?: string;
}

export function MemberSearchDialog({
    open,
    onOpenChange,
    onSelect,
    title = "Buscar Miembro",
    description = "Busca un miembro por nombre."
}: MemberSearchDialogProps) {
    const [search, setSearch] = useState('');
    const { members, loading } = useMembersList('MEMBER', open, search);
    const [selectedId, setSelectedId] = useState<string>('');

    // Reset search when opening
    React.useEffect(() => {
        if (open) {
            setSearch('');
            setSelectedId('');
        }
    }, [open]);

    const handleSelect = (member: MemberOption) => {
        setSelectedId(member.id);
        onSelect(member);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4">
                    <Command className="rounded-lg border shadow-sm" shouldFilter={false}>
                        <CommandInput
                            placeholder="Escribe para buscar..."
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

                            {!loading && members.length === 0 && search.length >= 2 && (
                                <CommandEmpty>No se encontraron miembros.</CommandEmpty>
                            )}

                            {!loading && members.length === 0 && search.length < 2 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Escribe al menos 2 caracteres para buscar.
                                </div>
                            )}

                            {!loading && members.length > 0 && (
                                <CommandGroup heading={search ? "Resultados de búsqueda" : "Sugerencias recientes"}>
                                    {members.map((member) => (
                                        <CommandItem
                                            key={member.id}
                                            value={member.id}
                                            onSelect={() => handleSelect(member)}
                                            className="cursor-pointer"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedId === member.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    {/* @ts-ignore - person might be inconsistent in types but usually has profileImage or avatarUrl */}
                                                    <AvatarImage src={member.person?.avatarUrl || member.person?.profileImage} />
                                                    <AvatarFallback className="text-xs">
                                                        {member.person.firstName?.[0]}{member.person.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {member.person.firstName} {member.person.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {member.membershipStatus || 'Miembro'}
                                                    </span>
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
