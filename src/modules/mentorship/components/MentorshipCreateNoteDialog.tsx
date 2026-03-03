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
import { Switch } from '@/components/ui/switch';

import { useCreateNote } from '../hooks/use-create-note';
import { createMentorshipNoteSchema, CreateMentorshipNoteFormValues } from '../schemas/mentorship-interactions.schema';

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
            isPrivate: false
        }
    });

    const onSubmit = async (data: CreateMentorshipNoteFormValues) => {
        try {
            await createNote({
                mentorshipId,
                payload: {
                    content: data.content,
                    isPrivate: data.isPrivate
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
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-slate-50">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-slate-500" />
                                    Nota Privada
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Solo visible para ti y la supervisión.
                                </p>
                            </div>
                            <Controller
                                control={control}
                                name="isPrivate"
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
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
