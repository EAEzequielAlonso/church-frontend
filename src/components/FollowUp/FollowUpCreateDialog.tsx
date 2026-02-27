import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import api from '@/lib/api';
import { toast } from 'sonner';

interface FollowUpCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function FollowUpCreateDialog({ open, onOpenChange, onSuccess }: FollowUpCreateDialogProps) {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.firstName || !form.lastName) {
            toast.error('Nombre y Apellido son requeridos');
            return;
        }

        setLoading(true);
        try {
            await api.post('/follow-ups', form);
            toast.success('Visitante creado exitosamente');
            setForm({ firstName: '', lastName: '', email: '', phone: '' });
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Error al crear visitante');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nuevo Visitante</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Apellido *</Label>
                            <Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creando...' : 'Crear'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
