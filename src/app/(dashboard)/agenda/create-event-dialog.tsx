import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarEventType, CreateCalendarEventDto, CalendarEvent } from "@/types/agenda";
import { toast } from 'sonner';
import { Plus, Pencil } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

interface CreateEventDialogProps {
    onEventCreated: () => void;
    defaultType?: CalendarEventType;
    defaultEntityId?: string; // ministryId or smallGroupId
    trigger?: React.ReactNode;
    eventToEdit?: CalendarEvent;
}

export function CreateEventDialog({ onEventCreated, defaultType, defaultEntityId, trigger, eventToEdit }: CreateEventDialogProps) {
    const isEditing = !!eventToEdit;
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Separate local state for simplified inputs
    const [dateInput, setDateInput] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [durationInput, setDurationInput] = useState('01:00');

    const [formData, setFormData] = useState<Partial<CreateCalendarEventDto>>({
        title: '',
        description: '',
        location: '',
        type: defaultType || CalendarEventType.PERSONAL,
        color: '#3b82f6', // blue
        isAllDay: false,
        ministryId: defaultType === CalendarEventType.MINISTRY ? defaultEntityId : undefined,
        smallGroupId: defaultType === CalendarEventType.SMALL_GROUP ? defaultEntityId : undefined
    });

    // Reset when opening or defaults change
    useEffect(() => {
        if (open) {
            if (eventToEdit) {
                setFormData({
                    title: eventToEdit.title,
                    description: eventToEdit.description || '',
                    location: eventToEdit.location || '',
                    type: eventToEdit.type,
                    color: eventToEdit.color || '#3b82f6',
                    isAllDay: eventToEdit.isAllDay,
                });
                const start = new Date(eventToEdit.startDate);
                const end = new Date(eventToEdit.endDate);
                setDateInput(start.toISOString().split('T')[0]);
                setTimeInput(start.toTimeString().slice(0, 5));

                // Calculate duration
                const diffMs = end.getTime() - start.getTime();
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                setDurationInput(`${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}`);
            } else {
                setFormData(prev => ({
                    ...prev,
                    title: '',
                    description: '',
                    location: '',
                    type: defaultType || prev.type || CalendarEventType.PERSONAL,
                    ministryId: defaultType === CalendarEventType.MINISTRY ? defaultEntityId : prev.ministryId,
                    smallGroupId: defaultType === CalendarEventType.SMALL_GROUP ? defaultEntityId : prev.smallGroupId
                }));
            }
        }
    }, [open, defaultType, defaultEntityId, eventToEdit]);

    const handleChange = (field: keyof CreateCalendarEventDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Combine Date + Time
            if (!dateInput || !timeInput) throw new Error("Fecha y hora son requeridas");

            const startDateTime = new Date(`${dateInput}T${timeInput}`);
            if (isNaN(startDateTime.getTime())) throw new Error("Fecha u hora inválida");

            // Calculate Duration
            const [hours, minutes] = durationInput.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) throw new Error("Formato de duración inválido (HH:mm)");

            const durationMs = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
            const endDateTime = new Date(startDateTime.getTime() + durationMs);

            const token = localStorage.getItem('accessToken');
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/agenda/${eventToEdit.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/agenda`;

            const res = await fetch(url, {
                method: isEditing ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    startDate: startDateTime.toISOString(),
                    endDate: endDateTime.toISOString()
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || `Error al ${isEditing ? 'editar' : 'crear'} evento`);
            }

            toast.success(`Evento ${isEditing ? 'editado' : 'creado'} exitosamente`);
            setOpen(false);
            // Reset minimal
            setFormData(prev => ({
                ...prev,
                title: '',
                description: '',
                location: '',
            }));
            setDateInput('');
            setTimeInput('');
            onEventCreated();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Check permissions
    const canCreateChurch = user?.permissions?.includes('AGENDA_CREATE_CHURCH');
    const canCreateMinistry = user?.permissions?.includes('AGENDA_CREATE_MINISTRY');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button className="font-bold gap-2 shadow-lg hover:shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        Nuevo Evento
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                            placeholder="Ej. Reunión de Líderes"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            {defaultType ? (
                                <Input disabled value={defaultType} className="bg-slate-100 font-mono text-xs" />
                            ) : (
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => handleChange('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={CalendarEventType.PERSONAL}>Personal</SelectItem>
                                        {canCreateMinistry && <SelectItem value={CalendarEventType.MINISTRY}>Ministerio</SelectItem>}
                                        <SelectItem value={CalendarEventType.SMALL_GROUP}>Grupo Pequeño</SelectItem>
                                        {canCreateChurch && <SelectItem value={CalendarEventType.CHURCH}>Iglesia</SelectItem>}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    className="w-12 h-10 p-1"
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    className="flex-grow font-mono text-xs uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    {formData.type === CalendarEventType.MINISTRY && !defaultEntityId && !isEditing && (
                        <div className="space-y-2">
                            <Label>ID del Ministerio</Label>
                            <Input
                                placeholder="UUID del Ministerio"
                                value={formData.ministryId || ''}
                                onChange={(e) => handleChange('ministryId', e.target.value)}
                                className="font-mono text-xs"
                            />
                        </div>
                    )}

                    {formData.type === CalendarEventType.SMALL_GROUP && !defaultEntityId && !isEditing && (
                        <div className="space-y-2">
                            <Label>ID del Grupo Pequeño</Label>
                            <Input
                                placeholder="UUID del Grupo Pequeño"
                                value={formData.smallGroupId || ''}
                                onChange={(e) => handleChange('smallGroupId', e.target.value)}
                                className="font-mono text-xs"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Input
                                type="date"
                                value={dateInput}
                                onChange={(e) => setDateInput(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hora Inicio</Label>
                            <Input
                                type="time"
                                value={timeInput}
                                onChange={(e) => setTimeInput(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Duración Estimada (HH:mm)</Label>
                        <Input
                            placeholder="Ej. 01:30 (1 hora 30 min)"
                            value={durationInput}
                            onChange={(e) => setDurationInput(e.target.value)}
                            className="font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Ubicación (Opcional)</Label>
                        <Input
                            placeholder="Ej. Casa de..."
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                            placeholder="Detalles del evento..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Crear Evento'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
