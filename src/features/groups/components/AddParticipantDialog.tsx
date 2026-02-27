import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useChurchPersons } from '../hooks/useChurchPersons';
import { GroupParticipantDto, GroupRole } from '../types/group.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddParticipantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentParticipants: GroupParticipantDto[];
    onAdd: (churchPersonId: string, role: GroupRole) => Promise<void>;
}

export function AddParticipantDialog({ open, onOpenChange, currentParticipants, onAdd }: AddParticipantDialogProps) {
    const { persons, isLoading } = useChurchPersons();
    const [selectedPersonId, setSelectedPersonId] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<GroupRole>('MEMBER');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const existingIds = new Set(currentParticipants.map(p => p.churchPerson.id));

    // Filtrar por busqueda y descartar si ya están
    const filteredPersons = persons.filter(p => {
        if (existingIds.has(p.id)) return false;
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return p.person.fullName.toLowerCase().includes(search) ||
            (p.person.email && p.person.email.toLowerCase().includes(search));
    });

    const handleSubmit = async () => {
        if (!selectedPersonId) return;
        setIsSubmitting(true);
        try {
            await onAdd(selectedPersonId, selectedRole);
            setSelectedPersonId('');
            setSelectedRole('MEMBER');
            setSearchTerm('');
            onOpenChange(false);
        } catch (error) {
            // handle error if needed
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                setSelectedPersonId('');
                setSearchTerm('');
            }
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Añadir Participante</DialogTitle>
                    <DialogDescription>
                        Busca en el directorio de la iglesia y asígnale un rol en este grupo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Buscar Persona</Label>
                        <input
                            type="text"
                            placeholder="Nombre o correo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Seleccionar</Label>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4 border rounded-md">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <div className="border rounded-md">
                                <ScrollArea className="h-[200px]">
                                    {filteredPersons.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            No se encontraron personas disponibles.
                                        </div>
                                    ) : (
                                        <div className="p-1">
                                            {filteredPersons.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => setSelectedPersonId(p.id)}
                                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${selectedPersonId === p.id ? 'bg-indigo-50 border-indigo-200 border' : 'hover:bg-slate-50 border border-transparent'}`}
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={p.person.profileImage} />
                                                        <AvatarFallback className="bg-slate-200 text-xs">
                                                            {p.person.firstName[0]}{p.person.lastName[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col flex-1">
                                                        <span className="text-sm font-medium text-slate-900 leading-tight">{p.person.fullName}</span>
                                                        <span className="text-xs text-slate-500">{p.membershipStatus}</span>
                                                    </div>
                                                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                                                        {selectedPersonId === p.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Rol del Participante</Label>
                        <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as GroupRole)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LEADER">Líder / Maestro</SelectItem>
                                <SelectItem value="CO_LEADER">Co-Líder / Auxiliar</SelectItem>
                                <SelectItem value="MEMBER">Participante / Alumno</SelectItem>
                                <SelectItem value="GUEST">Invitado Ocasional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedPersonId || isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Añadir al Grupo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
