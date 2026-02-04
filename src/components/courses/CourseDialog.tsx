'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CourseDialog({ open, onOpenChange, onSuccess, courseToEdit, defaultType = 'COURSE' }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: courseToEdit || {
            title: '',
            description: '',
            category: 'General',
            startDate: '',
            endDate: '',
            capacity: 0,
            color: defaultType === 'ACTIVITY' ? '#10b981' : '#6366f1',
            type: defaultType
        }
    });

    // Reset form when dialog opens/closes or course changes
    useEffect(() => {
        if (open) {
            if (courseToEdit) {
                reset({
                    ...courseToEdit,
                    // Format dates for input type="date"
                    startDate: courseToEdit.startDate ? new Date(courseToEdit.startDate).toISOString().split('T')[0] : '',
                    endDate: courseToEdit.endDate ? new Date(courseToEdit.endDate).toISOString().split('T')[0] : ''
                });
            } else {
                reset({
                    title: '',
                    description: '',
                    category: 'General',
                    startDate: '',
                    endDate: '',
                    capacity: 0,
                    color: defaultType === 'ACTIVITY' ? '#10b981' : '#6366f1',
                    type: defaultType
                });
            }
        }
    }, [open, courseToEdit, reset, defaultType]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // Clean payload
            const payload = {
                title: data.title,
                description: data.description,
                category: data.category,
                startDate: data.startDate,
                endDate: data.endDate || '', // Send empty string to clear date, not null (avoids 400)
                capacity: data.capacity ? parseInt(data.capacity) : 0,
                color: data.color,
                // type: data.type || defaultType // Don't send type on update unless we add it to DTO. For now better to exclude if editing.
                type: courseToEdit ? undefined : (data.type || defaultType) // Send only on create
            };

            // Date Validation
            if (payload.startDate && payload.endDate) {
                const start = new Date(payload.startDate);
                const end = new Date(payload.endDate);
                if (end < start) {
                    toast.error('La fecha de fin no puede ser anterior a la de inicio');
                    setIsLoading(false);
                    return;
                }
            }

            // Remove undefined keys to be clean
            if (courseToEdit) delete payload.type;

            if (courseToEdit) {
                await api.patch(`/courses/${courseToEdit.id}`, payload);
                toast.success('Curso actualizado');
            } else {
                await api.post('/courses', payload);
                toast.success(defaultType === 'ACTIVITY' ? 'Actividad creada exitosamente' : 'Curso creado exitosamente');
            }

            // Critical: Call onSuccess first, then close, then reset
            if (onSuccess) onSuccess();
            onOpenChange(false);
            reset();
        } catch (error: any) {
            console.error('Error in CourseDialog submit:', error);
            const msg = error.response?.data?.message || 'Error al guardar el curso';
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>{courseToEdit ? 'Editar Programa' : (defaultType === 'ACTIVITY' ? 'Nueva Actividad' : 'Nuevo Curso')}</DialogTitle>
                    <DialogDescription>
                        Define la información básica.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Nombre / Título</Label>
                            <Input {...register('title', { required: true })} placeholder={defaultType === 'ACTIVITY' ? "Ej: Salida a la Plaza" : "Ej: Curso de Membresía"} />
                        </div>

                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select
                                onValueChange={(val) => setValue('category', val)}
                                value={watch('category')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {defaultType === 'ACTIVITY' ? (
                                        <>
                                            <SelectItem value="Recreación">Recreación</SelectItem>
                                            <SelectItem value="Evangelismo">Evangelismo</SelectItem>
                                            <SelectItem value="Reparación Edilicia">Reparación Edilicia</SelectItem>
                                            <SelectItem value="Social">Social</SelectItem>
                                            <SelectItem value="Otros">Otros</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Membresía">Membresía</SelectItem>
                                            <SelectItem value="Taller">Taller</SelectItem>
                                            <SelectItem value="Seminario">Seminario</SelectItem>
                                            <SelectItem value="Otros">Otros</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Color Identificativo</Label>
                            <div className="flex gap-2">
                                <Input type="color" {...register('color')} className="w-full h-9 p-1 cursor-pointer" />
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Descripción</Label>
                            <Textarea {...register('description')} placeholder={defaultType === 'ACTIVITY' ? "¿De qué trata esta actividad?" : "¿De qué trata este curso?"} />
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Inicio</Label>
                            <Input type="date" {...register('startDate', { required: true })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Fin (Opcional)</Label>
                            <Input type="date" {...register('endDate')} />
                        </div>

                        <div className="space-y-2">
                            <Label>Cupo Máximo (Opcional)</Label>
                            <Input type="number" {...register('capacity')} placeholder="0 = Ilimitado" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {courseToEdit ? 'Guardar Cambios' : (defaultType === 'ACTIVITY' ? 'Crear Actividad' : 'Crear Curso')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
