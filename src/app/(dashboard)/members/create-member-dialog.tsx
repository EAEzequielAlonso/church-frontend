import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { EcclesiasticalRole, MembershipStatus } from '@/types/auth-types';
import { ROLE_UI_METADATA } from '@/constants/role-ui';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CreateMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateMemberDialog({ open, onOpenChange, onSuccess }: CreateMemberDialogProps) {
    const { register, handleSubmit, reset, control } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            documentId: '',
            birthDate: '',
            status: MembershipStatus.MEMBER,
            role: EcclesiasticalRole.NONE
        }
    });

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // Transform single role to field
            const payload = { ...data, ecclesiasticalRole: data.role };
            delete payload.role;

            await api.post('/members', payload);
            toast.success('Miembro creado exitosamente');
            reset();
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Error al crear el miembro';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nuevo Miembro</DialogTitle>
                    <DialogDescription>
                        Ingresa los datos personales y eclesiásticos del nuevo miembro.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input id="firstName" {...register('firstName')} required placeholder="Ej: Juan" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido</Label>
                            <Input id="lastName" {...register('lastName')} required placeholder="Ej: Pérez" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" {...register('email')} type="email" placeholder="juan@ejemplo.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Teléfono</Label>
                            <Input id="phoneNumber" {...register('phoneNumber')} placeholder="+54..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="documentId">DNI / Documento</Label>
                            <Input id="documentId" {...register('documentId')} placeholder="Número de identificación" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                            <Input id="birthDate" {...register('birthDate')} type="date" />
                        </div>

                        <div className="space-y-2">
                            <Label>Estado de Membresía</Label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(MembershipStatus).map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {ROLE_UI_METADATA[s]?.label || s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Rol Eclesiástico (Principal)</Label>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(EcclesiasticalRole).map((r) => (
                                                <SelectItem key={r} value={r}>
                                                    {ROLE_UI_METADATA[r]?.label || r}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                            {isLoading ? 'Guardando...' : 'Crear Miembro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

