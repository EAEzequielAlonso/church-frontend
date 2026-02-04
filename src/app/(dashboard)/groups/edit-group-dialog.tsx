'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Users } from 'lucide-react';
import { SmallGroup } from '@/types/small-group';

interface EditGroupDialogProps {
    group: SmallGroup;
    onGroupUpdated: () => void;
    trigger?: React.ReactNode;
}

export function EditGroupDialog({ group, onGroupUpdated, trigger }: EditGroupDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        objective: '',
        meetingDay: '',
        meetingTime: '',
        address: '',
        currentTopic: '',
        studyMaterial: '',
        openEnrollment: false,
        status: 'ACTIVE'
    });

    useEffect(() => {
        if (group && open) {
            setFormData({
                name: group.name || '',
                description: group.description || '',
                objective: group.objective || '',
                meetingDay: group.meetingDay || '',
                meetingTime: group.meetingTime || '',
                address: group.address || '',
                currentTopic: group.currentTopic || '',
                studyMaterial: group.studyMaterial || '',
                openEnrollment: group.openEnrollment || false,
                status: group.status || 'ACTIVE'
            });
        }
    }, [group, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${group.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al actualizar el grupo');
            }

            toast.success('Grupo actualizado exitosamente');
            setOpen(false);
            onGroupUpdated();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'No se pudo actualizar el grupo');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Editar Grupo Pequeño
                    </DialogTitle>
                    <DialogDescription>
                        Modifica la información del grupo y su estado.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid gap-4">
                        {/* Status Section Highlighted */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <Label htmlFor="status" className="font-semibold mb-2 block">Estado del Grupo</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => handleSelectChange('status', val)}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activo (Visible y editable)</SelectItem>
                                    <SelectItem value="SUSPENDED">Suspendido (Visible, sin actividad)</SelectItem>
                                    <SelectItem value="FINISHED">Finalizado (Solo lectura)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 mt-2">
                                * Los grupos finalizados pasan a <strong>Solo Lectura</strong> y no permiten agregar participantes ni eventos.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name" className="font-semibold">Nombre del Grupo *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción Corta</Label>
                            <Input
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="meetingDay">Día de Reunión</Label>
                                <Select
                                    value={formData.meetingDay}
                                    onValueChange={(val) => handleSelectChange('meetingDay', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar día" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lunes">Lunes</SelectItem>
                                        <SelectItem value="Martes">Martes</SelectItem>
                                        <SelectItem value="Miércoles">Miércoles</SelectItem>
                                        <SelectItem value="Jueves">Jueves</SelectItem>
                                        <SelectItem value="Viernes">Viernes</SelectItem>
                                        <SelectItem value="Sábado">Sábado</SelectItem>
                                        <SelectItem value="Domingo">Domingo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="meetingTime">Hora (HH:MM)</Label>
                                <Input
                                    id="meetingTime"
                                    name="meetingTime"
                                    type="time"
                                    value={formData.meetingTime}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Dirección / Ubicación</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="objective">Objetivo</Label>
                            <Textarea
                                id="objective"
                                name="objective"
                                value={formData.objective}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="currentTopic">Tema Actual</Label>
                                <Input
                                    id="currentTopic"
                                    name="currentTopic"
                                    value={formData.currentTopic}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="studyMaterial">Material</Label>
                                <Input
                                    id="studyMaterial"
                                    name="studyMaterial"
                                    value={formData.studyMaterial}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 border p-3 rounded-lg bg-slate-50">
                        <Switch
                            id="openEnrollment"
                            checked={formData.openEnrollment}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, openEnrollment: checked }))}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="openEnrollment" className="font-semibold cursor-pointer">
                                Inscripción Abierta
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Si se activa, cualquier miembro podrá unirse al grupo libremente desde el listado.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
