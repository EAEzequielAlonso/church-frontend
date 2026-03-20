import React, { useState } from 'react';
import { toast } from 'sonner';
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
    onAdd: (churchPersonIds: string[]) => Promise<void>;
}

export function AddParticipantDialog({ open, onOpenChange, currentParticipants, onAdd }: AddParticipantDialogProps) {
    const { persons, isLoading } = useChurchPersons();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

    const displayPersons = searchTerm ? filteredPersons : filteredPersons.slice(0, 15);

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const handleSubmit = async () => {
        if (selectedIds.size === 0) return;
        setIsSubmitting(true);
        try {
            await onAdd(Array.from(selectedIds));
            setSelectedIds(new Set());
            setSearchTerm('');
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error adding participants:', error);
            const message = error.response?.data?.message || 'Error al añadir los participantes';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                setSelectedIds(new Set());
                setSearchTerm('');
            }
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Añadir Participantes</DialogTitle>
                    <DialogDescription>
                        Selecciona a las personas que deseas añadir a este grupo. Todos entrarán con el rol de **Participante**.
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
                        <div className="flex justify-between items-center">
                            <Label>Directorio ({selectedIds.size} seleccionados)</Label>
                            {selectedIds.size > 0 && (
                                <button 
                                    onClick={() => setSelectedIds(new Set())}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Limpiar selección
                                </button>
                            )}
                        </div>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4 border rounded-md">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <div className="border rounded-md shadow-sm overflow-hidden">
                                <ScrollArea className="h-[250px]">
                                    {displayPersons.length === 0 ? (
                                        <div className="p-8 text-center text-sm text-slate-500">
                                            No se encontraron personas disponibles que no estén ya en el grupo.
                                        </div>
                                    ) : (
                                        <div className="p-1">
                                            {!searchTerm && (
                                                <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 mb-1">
                                                    Sugerencias
                                                </div>
                                            )}
                                            {displayPersons.map(p => {
                                                const isSelected = selectedIds.has(p.id);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => toggleSelection(p.id)}
                                                        className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200 border' : 'hover:bg-slate-50 border border-transparent'}`}
                                                    >
                                                        <Avatar className="h-9 w-9 border border-slate-200">
                                                            <AvatarImage src={p.person?.profileImage} />
                                                            <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px]">
                                                                {p.person?.firstName?.[0]}{p.person?.lastName?.[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span className="text-sm font-semibold text-slate-800 truncate">{p.person?.fullName}</span>
                                                            <span className="text-[10px] text-slate-500 font-medium uppercase">{p.membershipStatus}</span>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                                            {isSelected && <div className="w-2.5 h-1 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="bg-slate-50 p-4 -mx-6 -mb-6 border-t border-slate-100">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedIds.size === 0 || isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {selectedIds.size > 0 
                            ? `Añadir ${selectedIds.size} participante${selectedIds.size > 1 ? 's' : ''}` 
                            : 'Selecciona participantes'
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
