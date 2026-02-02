'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: string;
    existingMemberIds: string[];
    onMemberAdded: () => void;
}

export function AddMemberDialog({ open, onOpenChange, groupId, existingMemberIds, onMemberAdded }: AddMemberDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (open) {
            fetchMembers();
            setSearchTerm('');
        }
    }, [open]);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Fetched members for dialog:', data);
                setMembers(data);
            }
        } catch (error) {
            console.error('Failed to fetch members', error);
            toast.error('Error al cargar miembros');
        } finally {
            setIsLoading(false);
        }
    };

    const addMember = async (memberId: string) => {
        if (!memberId) {
            toast.error('Error: Identificador de miembro inválido');
            return;
        }

        setIsAdding(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ memberId: memberId })
            });

            if (!res.ok) throw new Error('Error al agregar miembro');

            toast.success('Miembro agregado al grupo');
            onMemberAdded();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo agregar al miembro');
        } finally {
            setIsAdding(false);
        }
    };

    const filteredMembers = members.filter(m => {
        // 1. Must not be in the group already
        // existingMemberIds are now ChurchMember IDs passed from parent
        if (existingMemberIds.includes(m.id)) return false;

        // 2. Search Filter
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();

        const firstName = m.person?.firstName?.toLowerCase() || '';
        const lastName = m.person?.lastName?.toLowerCase() || '';
        const fullName = m.person?.fullName?.toLowerCase() || '';
        const email = m.person?.email?.toLowerCase() || '';
        const role = m.ecclesiasticalRole?.toLowerCase() || '';

        return firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            fullName.includes(searchLower) ||
            email.includes(searchLower) ||
            email.includes(searchLower) ||
            role.includes(searchLower);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Miembros al Grupo</DialogTitle>
                    <DialogDescription>
                        Busca y selecciona miembros de la iglesia para unirlos a este grupo pequeño. No es necesario que tengan usuario de sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre, apellido o rol..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="h-[300px] rounded-md border border-slate-100 p-2 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                {searchTerm ? 'No se encontraron resultados' : 'Todos los miembros disponibles ya están en el grupo'}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredMembers.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {(member.person?.firstName || member.person?.fullName || '?').substring(0, 1)}
                                                {(member.person?.lastName || '').substring(0, 1)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {member.person?.firstName} {member.person?.lastName}
                                                </p>
                                                <p className="text-xs text-slate-500">{member.ecclesiasticalRole || 'Miembro'}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => addMember(member.id)}
                                            disabled={isAdding}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <UserPlus className="w-4 h-4 text-primary" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
