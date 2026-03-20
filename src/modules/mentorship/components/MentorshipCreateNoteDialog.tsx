'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquarePlus, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreateMentorshipNoteFormValues, createMentorshipNoteSchema } from '../schemas/mentorship-interactions.schema';
import { useCreateNote } from '../hooks/use-create-note';

interface MentorshipCreateNoteDialogProps {
    mentorshipId: string;
    isMentee: boolean;
}

export function MentorshipCreateNoteDialog({ mentorshipId, isMentee }: MentorshipCreateNoteDialogProps) {
    const [open, setOpen] = useState(false);
    const { createNote, isMutating } = useCreateNote();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm<CreateMentorshipNoteFormValues>({
        resolver: zodResolver(createMentorshipNoteSchema),
        defaultValues: {
            content: '',
            type: 'SHARED'
        }
    });

    const onSubmit = async (data: CreateMentorshipNoteFormValues) => {
        try {
            await createNote({
                mentorshipId,
                payload: {
                    content: data.content,
                    type: data.type
                }
            });
            toast.success('Nota guardada exitosamente');
            reset();
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la nota');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="font-semibold bg-slate-900 hover:bg-slate-800 text-white">
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    Añadir Nota
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nueva Nota del Proceso</DialogTitle>
                    <DialogDescription>
                        Registra observaciones, acuerdos o resúmenes de tus interacciones.
                    </DialogDescription>
                </DialogHeader>

                <form id="create-note-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="content">Contenido</Label>
                        <Textarea
                            id="content"
                            placeholder="Escribe el detalle aquí..."
                            className="h-32 resize-none"
                            {...register('content')}
                        />
                        {errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}
                    </div>

                    {!isMentee && (
                        <div className="space-y-2">
                            <Label htmlFor="type">Visibilidad y Tipo</Label>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SHARED">Compartida (Guiado + Mentores)</SelectItem>
                                            <SelectItem value="INTERNAL">Interna (Solo Mentores)</SelectItem>
                                            <SelectItem value="SUPERVISION">Supervisión (Mentores + Auditores)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <p className="text-[10px] text-slate-500 italic">
                                Define quién podrá leer esta nota en el futuro.
                            </p>
                        </div>
                    )}
                </form>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isMutating} type="button">Cancelar</Button>
                    <Button type="submit" form="create-note-form" disabled={isMutating} className="bg-primary hover:bg-primary/90">
                        {isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Guardar Nota
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
