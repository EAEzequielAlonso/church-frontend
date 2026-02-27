import React, { useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import { toast } from 'sonner';

interface FollowUpEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    followup: any; // Type strictly with FollowUpPerson
    onSuccess: () => void;
}

export function FollowUpEditDialog({ open, onOpenChange, followup, onSuccess }: FollowUpEditDialogProps) {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', status: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (followup) {
            setForm({
                firstName: followup.firstName,
                lastName: followup.lastName || '',
                email: followup.email || '',
                phone: followup.phone || '',
                status: followup.status || 'VISITOR'
            });
        }
    }, [followup]);

    const handleSubmit = async () => {
        if (!form.firstName || !form.lastName) {
            toast.error('Nombre y Apellido son requeridos');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/follow-ups/${followup.id}`, form);
            toast.success('Datos actualizados');
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Visitante</DialogTitle>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select
                            value={form.status}
                            onValueChange={(val) => setForm({ ...form, status: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="VISITOR">Visitante</SelectItem>
                                <SelectItem value="PROSPECT">Candidato a Miembro</SelectItem>
                                {/* Removed MEMBER and ARCHIVED to force specific flows if needed, or keep simple */}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Guardar Cambios' : 'Guardar'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
