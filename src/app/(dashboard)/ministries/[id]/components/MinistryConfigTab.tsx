import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ministry, ServiceDuty } from '@/types/ministry';
import { toast } from 'sonner';

interface MinistryConfigTabProps {
    ministry: Ministry;
    fetchMinistry: () => void;
    isLeaderOrCoordinator: boolean;
}

export function MinistryConfigTab({ ministry, fetchMinistry, isLeaderOrCoordinator }: MinistryConfigTabProps) {
    const [roleToDelete, setRoleToDelete] = useState<ServiceDuty | null>(null);
    const [roleToEdit, setRoleToEdit] = useState<ServiceDuty | null>(null);
    const [editRoleName, setEditRoleName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleToEdit || !editRoleName || editRoleName.trim() === roleToEdit.name) return;
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministry.id}/duties/${roleToEdit.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: editRoleName.trim() })
            });

            if (!res.ok) throw new Error('Error de validación');
            toast.success('Rol actualizado');
            fetchMinistry();
            setRoleToEdit(null);
        } catch (error) {
            toast.error('Error al actualizar nombre del rol');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministry.id}/duties/${roleToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al eliminar');
            toast.success('Rol eliminado');
            fetchMinistry();
            setRoleToDelete(null);
        } catch (error) {
            toast.error('Error al eliminar el rol');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4 outline-none">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Roles en Culto</h3>
                    <p className="text-sm text-slate-500">Administra los roles y tareas específicas de este ministerio.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 rounded-2xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-900">Roles de Culto</CardTitle>
                    <CardDescription>
                        Define las tareas que realizan los miembros en los cultos (ej. Predicación, Audio, Ujier).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLeaderOrCoordinator && (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const nameInput = form.elements.namedItem('dutyName') as HTMLInputElement;
                                const typeInput = form.elements.namedItem('dutyType') as HTMLSelectElement;
                                const name = nameInput.value;
                                const behaviorType = typeInput.value;

                                if (!name) return;

                                try {
                                    const token = localStorage.getItem('accessToken');
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministry.id}/duties`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ name, behaviorType })
                                    });
                                    if (!res.ok) throw new Error('Error al crear tarea');
                                    toast.success('Rol de culto agregado');
                                    nameInput.value = '';
                                    fetchMinistry();
                                } catch (error) {
                                    toast.error('Error al agregar rol');
                                }
                            }}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <div className="flex-1">
                                <input
                                    name="dutyName"
                                    type="text"
                                    placeholder="Nuevo rol (ej: Audio, Proyección)..."
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    required
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <select
                                    name="dutyType"
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                                >
                                    <option value="STANDARD">Estándar</option>
                                    <option value="MUSIC_LEADER">Dirección de Alabanza</option>
                                    <option value="SPEAKER">Enseñanza</option>
                                    <option value="ANNOUNCEMENTS">Anuncios</option>
                                </select>
                            </div>
                            <Button type="submit" size="sm" className="font-bold h-10">
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar
                            </Button>
                        </form>
                    )}

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {ministry.serviceDuties?.map((duty) => (
                            <div key={duty.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm group hover:border-slate-200 transition-colors">
                                <div>
                                    <span className="text-sm font-bold text-slate-700 block">{duty.name}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                        {({
                                            'STANDARD': 'Estándar',
                                            'MUSIC_LEADER': 'Dirección de Alabanza',
                                            'SPEAKER': 'Enseñanza',
                                            'ANNOUNCEMENTS': 'Anuncios'
                                        } as Record<string, string>)[duty.behaviorType] || 'Estándar'}
                                    </span>
                                </div>
                                {isLeaderOrCoordinator && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setRoleToEdit(duty);
                                                setEditRoleName(duty.name);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setRoleToDelete(duty)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!ministry.serviceDuties || ministry.serviceDuties.length === 0) && (
                            <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                                <p className="text-slate-400 text-xs font-medium">No hay roles de culto definidos.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!roleToEdit} onOpenChange={(open) => !open && setRoleToEdit(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Editar Rol de Culto</DialogTitle>
                        <DialogDescription>
                            Modifica el nombre del rol. El tipo de comportamiento seguirá siendo el mismo.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditRole} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="roleName" className="font-bold text-xs uppercase text-slate-500">Nombre del Rol</Label>
                            <Input
                                id="roleName"
                                value={editRoleName}
                                onChange={(e) => setEditRoleName(e.target.value)}
                                className="rounded-xl border-slate-200 focus:ring-primary/20 font-medium"
                                required
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setRoleToEdit(null)} className="rounded-xl font-bold">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving || !editRoleName || editRoleName.trim() === roleToEdit?.name} className="rounded-xl font-bold gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
                <AlertDialogContent className="rounded-3xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Eliminar Rol</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro que deseas eliminar el rol <span className="font-bold text-slate-700">"{roleToDelete?.name}"</span>? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="font-bold rounded-xl border-slate-200" disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white gap-2"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteRole();
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
