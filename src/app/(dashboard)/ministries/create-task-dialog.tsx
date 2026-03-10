'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { MinistryTask } from "@/types/ministry";

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ministryId: string;
    onSuccess: () => void;
    taskToEdit?: MinistryTask | null;
}

export function CreateTaskDialog({ open, onOpenChange, ministryId, onSuccess, taskToEdit }: CreateTaskDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedToId: 'none',
        dueDate: undefined as Date | undefined
    });

    useEffect(() => {
        if (open) {
            fetchMinistryMembers();
            if (taskToEdit) {
                setFormData({
                    title: taskToEdit.title,
                    description: taskToEdit.description || '',
                    assignedToId: taskToEdit.assignedTo?.id || 'none',
                    dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : undefined
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    assignedToId: 'none',
                    dueDate: undefined,
                });
            }
        }
    }, [open, taskToEdit]);

    const fetchMinistryMembers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministryId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members || []);
            }
        } catch (error) {
            console.error('Error fetching ministry members', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const payload: any = {
                title: formData.title,
                description: formData.description,
            };

            if (formData.assignedToId !== 'none') {
                payload.assignedToId = formData.assignedToId;
            }

            if (formData.dueDate) {
                payload.dueDate = formData.dueDate.toISOString();
            }

            const isEditing = !!taskToEdit;
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministryId}/tasks/${taskToEdit.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministryId}/tasks`;

            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Error al guardar tarea');

            toast.success(isEditing ? 'Misión actualizada exitosamente' : 'Misión creada exitosamente');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al crear la misión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                        {taskToEdit ? 'Editar Misión' : 'Nueva Misión'}
                    </DialogTitle>
                    <DialogDescription>
                        {taskToEdit ? 'Modifica los detalles de la misión existente.' : 'Asigna una tarea o responsabilidad a un miembro del ministerio.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-bold text-xs uppercase text-slate-500">Título de la Misión</Label>
                        <Input
                            id="title"
                            placeholder="Ej. Organizar snack, Preparar diapositivas..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="rounded-xl border-slate-200 focus:ring-primary/20 font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-bold text-xs uppercase text-slate-500">Descripción (Opcional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Detalles adicionales..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="rounded-xl border-slate-200 focus:ring-primary/20 min-h-[80px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignedTo" className="font-bold text-xs uppercase text-slate-500">Asignar a</Label>
                            <Select
                                value={formData.assignedToId}
                                onValueChange={(val) => setFormData({ ...formData, assignedToId: val })}
                            >
                                <SelectTrigger className="rounded-xl border-slate-200">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 max-h-[200px]">
                                    <SelectItem value="none" className="text-slate-400 italic">-- Sin asignar --</SelectItem>
                                    {members.map((m: any) => (
                                        <SelectItem key={m.member.id} value={m.member.id}>
                                            {m.member.person?.firstName} {m.member.person?.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-slate-500">Fecha Límite</Label>
                            <Input
                                type="date"
                                className="rounded-xl border-slate-200"
                                value={formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : ''}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
                            Cancelar
                        </Button>
                        <Button type="submit" className="rounded-xl font-bold gap-2" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {taskToEdit ? 'Guardar Cambios' : 'Crear Misión'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
