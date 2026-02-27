'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { followupApi } from '../api/followup.api';
import { UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FollowupAssignDialog({
    followupId,
    currentAssigneeId,
    trigger
}: {
    followupId: string;
    currentAssigneeId?: string;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [newAssigneeId, setNewAssigneeId] = useState(currentAssigneeId || '');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAssign = async () => {
        if (!newAssigneeId) return;
        setLoading(true);
        try {
            await followupApi.assign(followupId, newAssigneeId);
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Failed to assign', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Reasignar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar Responsable</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>ID del Nuevo Responsable</Label>
                        <Input
                            value={newAssigneeId}
                            onChange={(e) => setNewAssigneeId(e.target.value)}
                            placeholder="UUID del miembro"
                        />
                        <p className="text-xs text-muted-foreground">
                            Ingresa el ID del miembro de la iglesia (Person ID). En el futuro esto será un buscador.
                        </p>
                    </div>
                    <Button onClick={handleAssign} disabled={loading} className="w-full">
                        {loading ? 'Asignando...' : 'Confirmar Asignación'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
