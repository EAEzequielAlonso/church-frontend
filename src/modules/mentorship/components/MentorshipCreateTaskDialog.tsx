'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2, CheckSquare } from 'lucide-react';
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

import { useCreateTask } from '../hooks/use-create-task';
import { createMentorshipTaskSchema, CreateMentorshipTaskFormValues } from '../schemas/mentorship-interactions.schema';

interface MentorshipCreateTaskDialogProps {
    mentorshipId: string;
    participants: {
        id: string;
        churchPersonId: string;
        role: string;
    }[];
    getPersonName: (id: string) => string;
}

export function MentorshipCreateTaskDialog({ mentorshipId, participants, getPersonName }: MentorshipCreateTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const { createTask, isMutating } = useCreateTask();

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
            title: '',
            description: '',
            isGroupTask: false,
        }
    });

    const isGroupTask = watch('isGroupTask');

    const onSubmit = async (data: CreateMentorshipTaskFormValues) => {
        try {
            await createTask({
                mentorshipId,
                payload: {
                    title: data.title,
                    description: data.description,
                    dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
                    isGroupTask: data.isGroupTask,
                    assignedChurchPersonId: data.isGroupTask ? undefined : data.assignedChurchPersonId
                }
            });
            toast.success('Tarea creada exitosamente');
            reset();
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al crear la tarea');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200" size="sm">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Asignar Tarea
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Asignar Nueva Tarea</DialogTitle>
                    <DialogDescription>
                        Crea una meta o actividad para el proceso de mentoría.
                    </DialogDescription>
                </DialogHeader>

                <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título de la Tarea <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            placeholder="Ej: Leer capítulo 2, Escribir ensayo..."
                            {...register('title')}
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción (Opcional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Detalles sobre cómo debe hacerse..."
                            {...register('description')}
                            className="h-20 resize-none"
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
                        <p className="text-xs text-slate-500 -mt-2">
                            {isGroupTask ? "Todos los integrantes deberán completarla." : "Asignada a una persona específica."}
                        </p>

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
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isMutating} type="button">Cancelar</Button>
                    <Button type="submit" form="create-task-form" disabled={isMutating} className="bg-primary hover:bg-primary/90">
                        {isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Guardar Tarea
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
