'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

import { useUpdateTask } from '../hooks/use-update-task';
import { createMentorshipTaskSchema, CreateMentorshipTaskFormValues } from '../schemas/mentorship-interactions.schema';

interface MentorshipEditTaskDialogProps {
    task: {
        id: string;
        title: string;
        description?: string;
        mentorInstruction?: string;
        dueDate?: string;
        isGroupTask: boolean;
        assignedChurchPersonId?: string;
        meetingId?: string;
        status: string;
    };
    mentorshipId: string;
    participants: {
        id: string;
        churchPersonId: string;
        role: string;
    }[];
    getPersonName: (id: string) => string;
    meetings?: { id: string; title?: string; scheduledDate: string | Date }[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MentorshipEditTaskDialog({ task, mentorshipId, participants, getPersonName, meetings = [], open, onOpenChange }: MentorshipEditTaskDialogProps) {
    const { updateTask, isMutating } = useUpdateTask();

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors }
    } = useForm<CreateMentorshipTaskFormValues>({
        resolver: zodResolver(createMentorshipTaskSchema),
        defaultValues: {
            title: task.title,
            description: task.description || '',
            mentorInstruction: task.mentorInstruction || '',
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            isGroupTask: task.isGroupTask,
            assignedChurchPersonId: task.assignedChurchPersonId,
            meetingId: task.meetingId
        }
    });

    // Reset form when task changes or dialog opens
    useEffect(() => {
        if (open) {
            reset({
                title: task.title,
                description: task.description || '',
                mentorInstruction: task.mentorInstruction || '',
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                isGroupTask: task.isGroupTask,
                assignedChurchPersonId: task.assignedChurchPersonId,
                meetingId: task.meetingId
            });
        }
    }, [open, task, reset]);

    const isGroupTask = watch('isGroupTask');

    const onSubmit = async (data: CreateMentorshipTaskFormValues) => {
        try {
            await updateTask({
                mentorshipId,
                taskId: task.id,
                payload: {
                    title: data.title,
                    description: data.description,
                    dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
                    isGroupTask: data.isGroupTask,
                    assignedChurchPersonId: data.isGroupTask ? undefined : data.assignedChurchPersonId,
                    mentorInstruction: data.mentorInstruction,
                    meetingId: data.meetingId
                }
            });
            toast.success('Tarea actualizada exitosamente');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar la tarea');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Editar Tarea</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles de la meta o actividad del proceso.
                    </DialogDescription>
                </DialogHeader>

                <form id="edit-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-title">Título de la Tarea <span className="text-red-500">*</span></Label>
                        <Input
                            id="edit-title"
                            placeholder="Ej: Leer capítulo 2, Escribir ensayo..."
                            {...register('title')}
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Objetivo / Descripción (Opcional)</Label>
                        <Textarea
                            id="edit-description"
                            placeholder="Detalles sobre qué se busca lograr..."
                            {...register('description')}
                            className="h-16 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-mentorInstruction">Instrucción del Mentor</Label>
                        <Textarea
                            id="edit-mentorInstruction"
                            placeholder="Instrucciones específicas para el guiado..."
                            {...register('mentorInstruction')}
                            className="h-20 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Vincular a Encuentro (Opcional)</Label>
                        <Controller
                            control={control}
                            name="meetingId"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || "none"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sin encuentro asociado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin vincular</SelectItem>
                                        {meetings.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.title || "Encuentro"} - {format(new Date(m.scheduledDate), "d/M/yy")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Label>Fecha de Entrega (Opcional)</Label>
                        <Controller
                            control={control}
                            name="dueDate"
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Sin fecha límite</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex flex-row items-center justify-between">
                            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Asignación Grupal
                            </Label>
                            <Controller
                                control={control}
                                name="isGroupTask"
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        {!isGroupTask && (
                            <div className="space-y-2">
                                <Label>Responsable</Label>
                                <Controller
                                    control={control}
                                    name="assignedChurchPersonId"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona a un participante" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {participants.map((p) => (
                                                    <SelectItem key={p.churchPersonId} value={p.churchPersonId}>
                                                        {getPersonName(p.churchPersonId)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.assignedChurchPersonId && <p className="text-red-500 text-xs">{errors.assignedChurchPersonId.message}</p>}
                            </div>
                        )}
                    </div>
                </form>

                <DialogFooter className="pt-4 mt-2 border-t border-slate-100">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMutating} type="button">Cancelar</Button>
                    <Button type="submit" form="edit-task-form" disabled={isMutating} className="bg-primary hover:bg-primary/90">
                        {isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        <Save className="w-4 h-4 mr-2" />
                        Actualizar Tarea
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
