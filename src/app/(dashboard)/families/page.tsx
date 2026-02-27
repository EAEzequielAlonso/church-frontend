'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useFamilies } from '@/features/families/hooks/useFamilies';
import { useDeleteFamily } from '@/features/families/hooks/useDeleteFamily';
import FamilyCard from '@/features/families/components/FamilyCard';
import { FamilyDialog } from '@/features/families/components/FamilyDialog';
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

export default function FamiliesPage() {
    const { user } = useAuth();
    const canManageFamilies = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';

    // Feature Hook
    const { families, isLoading, error, mutate } = useFamilies();
    const { execute: deleteFamily, isLoading: isDeleting } = useDeleteFamily();

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

    // Delete State
    const [familyToDelete, setFamilyToDelete] = useState<string | null>(null);

    const handleCreate = () => {
        setSelectedFamilyId(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (id: string) => {
        setSelectedFamilyId(id);
        setIsDialogOpen(true);
    };

    const confirmDelete = (id: string) => {
        setFamilyToDelete(id);
    };

    const handleDelete = async () => {
        if (familyToDelete) {
            await deleteFamily(familyToDelete, () => {
                mutate();
                setFamilyToDelete(null);
            });
        }
    };

    const filteredFamilies = families?.filter(f =>
        f.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <ErrorBoundary sectionName="Familias">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Familias</h1>
                        <p className="text-gray-500 mt-1">Gestiona los núcleos familiares de tu iglesia</p>
                    </div>
                    {canManageFamilies && (
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Familia
                        </Button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre de familia..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : filteredFamilies.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No se encontraron familias.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFamilies.map((family) => (
                            <FamilyCard
                                key={family.id}
                                family={family}
                                canManage={!!canManageFamilies}
                                onEdit={handleEdit}
                                onDelete={confirmDelete}
                            />
                        ))}
                    </div>
                )}

                <FamilyDialog
                    familyId={selectedFamilyId}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSuccess={mutate}
                />

                <AlertDialog open={!!familyToDelete} onOpenChange={(open) => !open && setFamilyToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción eliminará el vínculo familiar permanentemente.
                                Los miembros NO serán eliminados del sistema.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                {isDeleting ? 'Eliminando...' : 'Eliminar Familia'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ErrorBoundary>
    );
}
