'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompleteTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ministryId: string;
    task: any | null; // MinistryTask type
    onSuccess: () => void;
}

export function CompleteTaskDialog({ open, onOpenChange, ministryId, task, onSuccess }: CompleteTaskDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [observation, setObservation] = useState('');

    useEffect(() => {
        if (open) {
            setObservation('');
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministryId}/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'completed',
                    observation: observation
                })
            });

            if (!res.ok) throw new Error('Error al completar tarea');

            toast.success('Misión completada');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al completar la misión');
        } finally {
            setIsLoading(false);
        }
    };

    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Completar Misión</DialogTitle>
                    <DialogDescription>
                        Estás a punto de marcar como completada la tarea <span className="font-bold text-slate-700">"{task.title}"</span>.
                        ¿Deseas agregar alguna observación?
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="observation" className="font-bold text-xs uppercase text-slate-500">Observación (Opcional)</Label>
                        <Textarea
                            id="observation"
                            placeholder="Ej. Se realizó con éxito, faltaron materiales..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            className="rounded-xl border-slate-200 focus:ring-primary/20 min-h-[100px]"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
                            Cancelar
                        </Button>
                        <Button type="submit" className="rounded-xl font-bold gap-2 bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Completar Misión
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
