import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { GroupType, GroupVisibility, CreateGroupDto, UpdateGroupDto, GroupDto } from '../types/group.types';
import { getGroupTypeConfig } from '../config/group-type.config';

const groupSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo'),
    description: z.string().optional(),
    type: z.enum(['SMALL_GROUP', 'COURSE', 'ACTIVITY', 'DISCIPLESHIP', 'MINISTRY_TEAM']),
    visibility: z.enum(['PUBLIC', 'PRIVATE']),
    schedule: z.string().optional(),
    address: z.string().optional(),
    objective: z.string().optional(),
    hasStudyMaterial: z.boolean().optional(),
    studyMaterial: z.string().optional(),
});

export type GroupFormValues = z.infer<typeof groupSchema>;

interface GroupFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialType?: GroupType;
    fixedType?: boolean;
    editingGroup?: GroupDto | null;
    onSubmit: (data: CreateGroupDto | UpdateGroupDto) => Promise<void>;
}

export function GroupForm({
    open,
    onOpenChange,
    initialType = 'SMALL_GROUP',
    fixedType = false,
    editingGroup,
    onSubmit
}: GroupFormProps) {
    const isEditing = !!editingGroup;

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            name: '',
            description: '',
            type: initialType,
            visibility: 'PUBLIC',
            schedule: '',
            address: '',
            objective: '',
            hasStudyMaterial: false,
            studyMaterial: ''
        }
    });

    const currentType = watch('type');
    const currentVisibility = watch('visibility');
    const hasStudyMaterial = watch('hasStudyMaterial');

    // Fallback to SMALL_GROUP config if type goes undefined suddenly
    const config = getGroupTypeConfig(currentType || 'SMALL_GROUP');

    useEffect(() => {
        if (open) {
            if (editingGroup) {
                reset({
                    name: editingGroup.name,
                    description: editingGroup.description || '',
                    type: editingGroup.type,
                    visibility: editingGroup.visibility,
                    schedule: editingGroup.schedule || '',
                    address: editingGroup.address || '',
                    objective: editingGroup.objective || '',
                    hasStudyMaterial: editingGroup.hasStudyMaterial || false,
                    studyMaterial: editingGroup.studyMaterial || ''
                });
            } else {
                reset({
                    name: '',
                    description: '',
                    type: initialType,
                    visibility: 'PUBLIC',
                    schedule: '',
                    address: '',
                    objective: '',
                    hasStudyMaterial: false,
                    studyMaterial: ''
                });
            }
        }
    }, [open, editingGroup, initialType, reset]);

    const handleFormSubmit = async (data: GroupFormValues) => {
        try {
            await onSubmit(data as CreateGroupDto | UpdateGroupDto);
            onOpenChange(false);
        } catch (error) {
            // Error managed by hook or caller if they want to display toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <config.icon className={`w-6 h-6 ${config.color}`} />
                        {isEditing ? `Editar ${config.label}` : `Crear Nuevo ${config.label}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 mt-4">
                    <div className="space-y-4">

                        {/* Mostrar selector de tipo solo si NO es edicion y NO esta fijado desde el tab */}
                        {!isEditing && !fixedType && (
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo</Label>
                                <Select
                                    value={currentType}
                                    onValueChange={(val) => setValue('type', val as GroupType, { shouldValidate: true })}
                                >
                                    <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Seleccione el tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SMALL_GROUP">Grupo Pequeño</SelectItem>
                                        <SelectItem value="COURSE">Curso / Clase</SelectItem>
                                        <SelectItem value="ACTIVITY">Evento / Actividad</SelectItem>
                                        <SelectItem value="DISCIPLESHIP">Discipulado</SelectItem>
                                        <SelectItem value="MINISTRY_TEAM">Equipo Ministerial</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <span className="text-xs text-red-500 font-medium">{errors.type.message}</span>}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre / Título <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                {...register('name')}
                                placeholder={`Ej: ${config.label} de Jóvenes`}
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <span className="text-xs text-red-500 font-medium">{errors.name.message}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Breve resumen o propósito..."
                                rows={3}
                                className={errors.description ? "border-red-500" : ""}
                            />
                            {errors.description && <span className="text-xs text-red-500 font-medium">{errors.description.message}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="objective">Objetivo</Label>
                            <Input
                                id="objective"
                                {...register('objective')}
                                placeholder="Ej: Fomentar el crecimiento espiritual y compañerismo"
                                className={errors.objective ? "border-red-500" : ""}
                            />
                            {errors.objective && <span className="text-xs text-red-500 font-medium">{errors.objective.message}</span>}
                        </div>

                        <div className="flex flex-col gap-4 p-4 border rounded-md bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Material de Estudio</Label>
                                    <p className="text-sm text-muted-foreground">
                                        ¿Se utilizará un libro o guía de estudio en las reuniones?
                                    </p>
                                </div>
                                <Switch
                                    checked={hasStudyMaterial}
                                    onCheckedChange={(checked) => {
                                        setValue('hasStudyMaterial', checked, { shouldValidate: true });
                                        if (!checked) {
                                            setValue('studyMaterial', '');
                                        }
                                    }}
                                />
                            </div>

                            {hasStudyMaterial && (
                                <div className="grid gap-2 pt-2 border-t mt-2">
                                    <Label htmlFor="studyMaterial">Nombre del material de estudio</Label>
                                    <Input
                                        id="studyMaterial"
                                        {...register('studyMaterial')}
                                        placeholder="Ej: Libro de Romanos, Curso de Liderazgo Módulo 1..."
                                        className={errors.studyMaterial ? "border-red-500" : ""}
                                    />
                                    {errors.studyMaterial && <span className="text-xs text-red-500 font-medium">{errors.studyMaterial.message}</span>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="visibility">Visibilidad</Label>
                                <Select
                                    value={currentVisibility}
                                    onValueChange={(val) => setValue('visibility', val as GroupVisibility, { shouldValidate: true })}
                                >
                                    <SelectTrigger className={errors.visibility ? "border-red-500" : ""}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PUBLIC">Público</SelectItem>
                                        <SelectItem value="PRIVATE">Privado u Oculto</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.visibility && <span className="text-xs text-red-500 font-medium">{errors.visibility.message}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="schedule">Horario Regular</Label>
                                <Input
                                    id="schedule"
                                    {...register('schedule')}
                                    placeholder="Ej: Sábados 18:00 hs"
                                    className={errors.schedule ? "border-red-500" : ""}
                                />
                                {errors.schedule && <span className="text-xs text-red-500 font-medium">{errors.schedule.message}</span>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Ubicación / Dirección</Label>
                            <Input
                                id="address"
                                {...register('address')}
                                placeholder="Link de Zoom, Salón principal, o Calle"
                                className={errors.address ? "border-red-500" : ""}
                            />
                            {errors.address && <span className="text-xs text-red-500 font-medium">{errors.address.message}</span>}
                        </div>

                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${config.bgColor.split(' ')[0].replace('bg-', 'bg-').replace('50', '600')} hover:opacity-90 text-white border-0`}
                        >
                            {isSubmitting ? "Guardando..." : (isEditing ? "Guardar Cambios" : config.createButtonLabel)}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
