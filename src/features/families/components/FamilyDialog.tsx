'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FamilyForm } from './FamilyForm';
import { useCreateFamily } from '../hooks/useCreateFamily';
import { useUpdateFamily } from '../hooks/useUpdateFamily';
import { useFamily } from '../hooks/useFamily';
import { useRemoveFamilyMember } from '../hooks/useRemoveFamilyMember';
import { Button } from '@/components/ui/button';
import { FamilyMembersList } from './FamilyMembersList';
import { AddFamilyMemberDialog } from './AddFamilyMemberDialog';
import { Trash2, Plus, UserPlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getFamilyRoleLabel } from '../utils/role.utils';

interface FamilyDialogProps {
    familyId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function FamilyDialog({ familyId, open, onOpenChange, onSuccess }: FamilyDialogProps) {
    const isEdit = !!familyId;

    // Hooks
    const { family, isLoading: isLoadingFamily, mutate: mutateFamily } = useFamily(familyId);
    const { execute: createFamily, isLoading: isCreating } = useCreateFamily();
    const { execute: updateFamily, isLoading: isUpdating } = useUpdateFamily();
    const { execute: removeMember, isLoading: isRemoving } = useRemoveFamilyMember();

    // Secondary Dialog State
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

    const handleFormSubmit = async (data: any) => {
        if (isEdit && familyId) {
            const success = await updateFamily(familyId, data);
            if (success) {
                onSuccess();
                onOpenChange(false);
            }
        } else {
            const result = await createFamily(data);
            if (result) {
                onSuccess();
                onOpenChange(false);
            }
        }
    };

    const confirmRemoveMember = async () => {
        if (!familyId || !memberToRemove) return;

        await removeMember(familyId, memberToRemove, () => {
            mutateFamily();
            onSuccess();
            setMemberToRemove(null);
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Gestionar Familia' : 'Nueva Familia'}</DialogTitle>
                        <DialogDescription>
                            {isEdit
                                ? 'Actualiza el nombre de la familia o gestiona sus miembros.'
                                : 'Crea una nueva familia e ingresa sus miembros iniciales.'}
                        </DialogDescription>
                    </DialogHeader>

                    {isEdit && isLoadingFamily ? (
                        <div className="py-8 text-center text-sm text-gray-500">Cargando detalles...</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Main Form (Name + Creation inputs) */}
                            <FamilyForm
                                isEdit={isEdit}
                                initialData={family ? { name: family.name } : undefined}
                                onSubmit={handleFormSubmit}
                                isLoading={isCreating || isUpdating}
                                onCancel={() => onOpenChange(false)}
                            />

                            {/* Edit Mode: Member Management Section */}
                            {isEdit && family && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-bold text-slate-700">Miembros Actuales</h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsAddMemberOpen(true)}
                                            className="text-xs h-8 ml-auto"
                                        >
                                            <UserPlus className="w-3 h-3 mr-2" />
                                            Agregar Miembro
                                        </Button>
                                    </div>

                                    <div className="space-y-2 bg-slate-50 p-3 rounded-md">
                                        {family.members.length === 0 && <p className="text-xs text-gray-400">No hay miembros.</p>}
                                        {family.members.map(fm => (
                                            <div key={fm.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${fm.role === 'FATHER' ? 'bg-blue-100 text-blue-700' :
                                                        fm.role === 'MOTHER' ? 'bg-pink-100 text-pink-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {getFamilyRoleLabel(fm.role)}
                                                    </span>
                                                    <span>{fm.member.person.fullName}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                                    onClick={() => setMemberToRemove(fm.member.id)}
                                                    disabled={isRemoving}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {isEdit && familyId && (
                <AddFamilyMemberDialog
                    familyId={familyId}
                    open={isAddMemberOpen}
                    onOpenChange={setIsAddMemberOpen}
                    onSuccess={() => { mutateFamily(); onSuccess(); }}
                    currentMemberIds={family?.members.map(m => m.member.id) || []}
                />
            )}

            <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción quitará al miembro de la familia. No eliminará a la persona de la base de datos de la iglesia.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); confirmRemoveMember(); }}
                            disabled={isRemoving}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isRemoving ? 'Quitando...' : 'Quitar Miembro'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
