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
import { Plus, Users } from 'lucide-react';

interface CreateGroupDialogProps {
    onGroupCreated: () => void;
}

export function CreateGroupDialog({ onGroupCreated }: CreateGroupDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
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
        leaderId: ''
    });

    useEffect(() => {
        if (open) {
            fetchMembers();
        }
    }, [open]);

    const fetchMembers = async () => {
        setIsLoadingMembers(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Failed to fetch members', error);
            toast.error('Error al cargar miembros');
        } finally {
            setIsLoadingMembers(false);
        }
    };

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Error al crear el grupo');

            toast.success('Grupo creado exitosamente');
            setOpen(false);
            setFormData({
                name: '',
                description: '',
                objective: '',
                meetingDay: '',
                meetingTime: '',
                address: '',
                currentTopic: '',
                studyMaterial: '',
                openEnrollment: false,
                leaderId: ''
            });
            onGroupCreated();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo crear el grupo');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Grupo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Crear Nuevo Grupo Pequeño
                    </DialogTitle>
                    <DialogDescription>
                        Completa la información básica para dar de alta un nuevo grupo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="font-semibold">Nombre del Grupo *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ej: Jóvenes Adultos - Norte"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Leader Selection */}
                        <div className="grid gap-2">
                            <Label htmlFor="leaderId" className="font-semibold">Encargado (Líder) *</Label>
                            <Select
                                value={formData.leaderId}
                                onValueChange={(val) => handleSelectChange('leaderId', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingMembers ? "Cargando miembros..." : "Seleccionar encargado"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {members.length === 0 ? (
                                        <SelectItem value="none" disabled>No hay miembros disponibles</SelectItem>
                                    ) : (
                                        members.map((member) => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.person?.firstName} {member.person?.lastName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                * El encargado será asignado automáticamente como MODERADOR del grupo.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción Corta</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Breve descripción del propósito del grupo"
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
                                placeholder="Ej: Casa de Juan, Av. Siempre Viva 123"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="objective">Objetivo</Label>
                            <Textarea
                                id="objective"
                                name="objective"
                                placeholder="¿Cuál es la meta principal de este grupo?"
                                value={formData.objective}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="currentTopic">Tema Actual (Opcional)</Label>
                                <Input
                                    id="currentTopic"
                                    name="currentTopic"
                                    placeholder="Ej: El libro de Romanos"
                                    value={formData.currentTopic}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="studyMaterial">Material (Opcional)</Label>
                                <Input
                                    id="studyMaterial"
                                    name="studyMaterial"
                                    placeholder="Libro, PDF, Video..."
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
                            {isLoading ? 'Creando...' : 'Crear Grupo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
