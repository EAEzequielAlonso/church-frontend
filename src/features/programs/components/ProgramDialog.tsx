'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { programsApi } from '../api/programs.api';
import { ProgramCategory, ProgramDto } from '../types/program.types';

interface ProgramDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    programToEdit?: ProgramDto;
    defaultType?: ProgramCategory;
}

export default function ProgramDialog({ open, onOpenChange, onSuccess, programToEdit, defaultType = 'COURSE' }: ProgramDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
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

    useEffect(() => {
        if (open) {
            if (programToEdit) {
                reset({
                    title: programToEdit.title,
                    description: programToEdit.description || '',
                    category: programToEdit.category || 'General',
                    startDate: programToEdit.startDate ? new Date(programToEdit.startDate).toISOString().split('T')[0] : '',
                    endDate: programToEdit.endDate ? new Date(programToEdit.endDate).toISOString().split('T')[0] : '',
                    capacity: programToEdit.capacity || 0,
                    color: programToEdit.color || (defaultType === 'ACTIVITY' ? '#10b981' : '#6366f1'),
                    type: programToEdit.type
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
    }, [open, programToEdit, reset, defaultType]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const payload: any = {
                title: data.title,
                description: data.description,
                category: data.category,
                startDate: data.startDate,
                endDate: data.endDate || '',
                capacity: data.capacity ? parseInt(data.capacity) : 0,
                color: data.color,
                // type: Sent only on creation
            };

            if (!programToEdit) {
                payload.type = data.type || defaultType;
            }

            if (payload.startDate && payload.endDate) {
                const start = new Date(payload.startDate);
                const end = new Date(payload.endDate);
                if (end < start) {
                    toast.error('La fecha de fin no puede ser anterior a la de inicio');
                    setIsLoading(false);
                    return;
                }
            }

            if (programToEdit) {
                await programsApi.update(programToEdit.id, payload);
                toast.success('Programa actualizado');
            } else {
                await programsApi.create(payload as any);
                toast.success(defaultType === 'ACTIVITY' ? 'Actividad creada exitosamente' : 'Curso creado exitosamente');
            }

            if (onSuccess) onSuccess();
            onOpenChange(false);
            reset();
        } catch (error: any) {
            console.error('Error in ProgramDialog submit:', error);
            const msg = error.response?.data?.message || 'Error al guardar el programa';
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setIsLoading(false);
        }
    };

    const isActivity = (programToEdit?.type || defaultType) === 'ACTIVITY';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>{programToEdit ? 'Editar Programa' : (isActivity ? 'Nueva Actividad' : 'Nuevo Curso')}</DialogTitle>
                    <DialogDescription>
                        Define la información básica.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Nombre / Título</Label>
                            <Input {...register('title', { required: true })} placeholder={isActivity ? "Ej: Salida a la Plaza" : "Ej: Curso de Membresía"} />
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
                                    {isActivity ? (
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
                            <Textarea {...register('description')} placeholder={isActivity ? "¿De qué trata esta actividad?" : "¿De qué trata este curso?"} />
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
                            {programToEdit ? 'Guardar Cambios' : (isActivity ? 'Crear Actividad' : 'Crear Curso')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
