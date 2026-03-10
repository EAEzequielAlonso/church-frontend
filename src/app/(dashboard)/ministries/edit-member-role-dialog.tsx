'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { MinistryMember } from '@/types/ministry';
import { MinistryRole } from '@/types/auth-types';

interface EditMemberRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ministryId: string;
    member: MinistryMember | null;
    onSuccess: () => void;
}

export function EditMemberRoleDialog({ open, onOpenChange, ministryId, member, onSuccess }: EditMemberRoleDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<MinistryRole>(member?.roleInMinistry || MinistryRole.TEAM_MEMBER);

    // Update role state when member changes
    useEffect(() => {
        if (member && open) {
            setRole(member.roleInMinistry);
        }
    }, [member, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!member) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministryId}/members/${member.member.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            });

            if (!res.ok) throw new Error('Error al actualizar rol');

            toast.success('Rol actualizado correctamente');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo actualizar el rol');
        } finally {
            setIsLoading(false);
        }
    };

    if (!member) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl gap-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-900">
                        Editar Rol
                    </DialogTitle>
                    <p className="text-sm text-slate-500">
                        Cambia el rol de <span className="font-bold text-slate-800">{member.member.person.firstName} {member.member.person.lastName}</span> en el ministerio.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select
                            value={role}
                            onValueChange={(value) => setRole(value as MinistryRole)}
                        >
                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={MinistryRole.LEADER}>Líder</SelectItem>
                                <SelectItem value={MinistryRole.COORDINATOR}>Coordinador</SelectItem>
                                <SelectItem value={MinistryRole.TEAM_MEMBER}>Miembro del Equipo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="font-bold">
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
