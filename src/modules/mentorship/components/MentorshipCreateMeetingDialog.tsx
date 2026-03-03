'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { es } from 'date-fns/locale';
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
} from "@/components/ui/popover"

import { useCreateMeeting } from '../hooks/use-create-meeting';
import { createMentorshipMeetingSchema, CreateMentorshipMeetingFormValues } from '../schemas/mentorship-interactions.schema';

interface MentorshipCreateMeetingDialogProps {
    mentorshipId: string;
}

export function MentorshipCreateMeetingDialog({ mentorshipId }: MentorshipCreateMeetingDialogProps) {
    const [open, setOpen] = useState(false);
    const { createMeeting, isMutating } = useCreateMeeting();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm<CreateMentorshipMeetingFormValues>({
        resolver: zodResolver(createMentorshipMeetingSchema),
        defaultValues: {
            location: ''
        }
    });

    const onSubmit = async (data: CreateMentorshipMeetingFormValues) => {
        try {
            await createMeeting({
                mentorshipId,
                payload: {
                    scheduledDate: data.scheduledDate.toISOString(),
                    location: data.location || undefined
                }
            });
            toast.success('Encuentro programado exitosamente');
            reset();
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al programar el encuentro');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="font-semibold" size="sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Programar Encuentro
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Programar Nuevo Encuentro</DialogTitle>
                    <DialogDescription>
                        Fija una fecha y un lugar para la próxima reunión del proceso.
                    </DialogDescription>
                </DialogHeader>

                <form id="create-meeting-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2 flex flex-col">
                        <Label>Fecha del Encuentro</Label>
                        <Controller
                            control={control}
                            name="scheduledDate"
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
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
                        {errors.scheduledDate && <p className="text-red-500 text-xs">{errors.scheduledDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Ubicación (Opcional)</Label>
                        <Input
                            id="location"
                            placeholder="Ej: Salón Principal, Zoom..."
                            {...register('location')}
                        />
                    </div>
                </form>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isMutating} type="button">Cancelar</Button>
                    <Button type="submit" form="create-meeting-form" disabled={isMutating} className="bg-primary hover:bg-primary/90">
                        {isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
