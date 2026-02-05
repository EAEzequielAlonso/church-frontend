"use client";

import api from '@/lib/api';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, CalendarHeart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import { useAuth } from '@/context/AuthContext';
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
import { toast } from 'sonner';
import { JoinFamilyDialog } from '@/components/activities/JoinFamilyDialog';
import { usePrograms } from '@/features/programs/hooks/usePrograms';
import { useProgramMutations } from '@/features/programs/hooks/useProgramMutations';
import { programsApi } from '@/features/programs/api/programs.api';
import ProgramCard from '@/features/programs/components/ProgramCard';
import ProgramDialog from '@/features/programs/components/ProgramDialog';
import { ProgramCategory } from '@/features/programs/types/program.types';

const PROGRAM_TYPE: ProgramCategory = 'ACTIVITY';

export default function ActivitiesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { programs, isLoading, mutate } = usePrograms(PROGRAM_TYPE);
    const { changeStatus, deleteProgram } = useProgramMutations();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

    // Delete State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState<string | null>(null);

    // Leave State
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [programToLeave, setProgramToLeave] = useState<string | null>(null);

    const isAdminOrAuditor = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';

    const handleShare = (program: any) => {
        const text = `Te invito a la actividad "${program.title}". ${program.description || ''}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleDeleteClick = (id: string) => {
        setProgramToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!programToDelete) return;
        await deleteProgram(programToDelete, () => {
            mutate();
        });
        setDeleteConfirmOpen(false);
        setProgramToDelete(null);
    };

    const handleStatusChange = async (id: string, newStatus: any) => {
        await changeStatus(id, newStatus, () => mutate());
    };

    const handleLeaveClick = (id: string) => {
        setProgramToLeave(id);
        setLeaveConfirmOpen(true);
    };

    const confirmLeave = async () => {
        if (!programToLeave) return;
        try {
            await programsApi.leave(programToLeave);
            toast.success('Ya no estás inscrito');
            mutate();
        } catch (err) {
            toast.error('Error al salir');
        }
        setLeaveConfirmOpen(false);
        setProgramToLeave(null);
    };

    const handleJoinClick = async (programId: string) => {
        try {
            // Check if user has family
            // We assume 404 or empty means no family
            let hasFamily = false;
            try {
                const res = await api.get('/families/my-family');
                if (res.data && res.data.members && res.data.members.length > 0) {
                    hasFamily = true;
                }
            } catch (e) {
                // Ignore error, assume no family (404)
            }

            if (hasFamily) {
                setSelectedProgramId(programId);
                setIsJoinDialogOpen(true);
            } else {
                // Direct Join (Join as Self)
                if (user?.memberId) {
                    await programsApi.join(programId, [user.memberId]);
                    toast.success('Inscripción realizada con éxito');
                    mutate();
                } else {
                    toast.error('No se pudo identificar tu usuario miembro');
                }
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al inscribirse';
            toast.error(msg);
        }
    };

    return (
        <>
            <PageContainer title="Actividades y Eventos" description="Calendario de actividades de la congregación">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Buscar actividad..."
                            className="pl-9 bg-white"
                        />
                    </div>
                    {isAdminOrAuditor && (
                        <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Actividad
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs?.map((program) => {
                        const isEnrolled = program.participants?.some(p => p.member.id === user?.memberId);

                        return (
                            <ProgramCard
                                key={program.id}
                                program={program}
                                isAdminOrAuditor={isAdminOrAuditor || false}
                                isEnrolled={!!isEnrolled}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDeleteClick}
                                onJoin={() => handleJoinClick(program.id)}
                                onLeave={handleLeaveClick}
                                onViewStart={(id) => router.push(`/activities/${id}`)}
                                onShare={handleShare}
                            />
                        );
                    })}

                    {(!programs || programs.length === 0) && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <CalendarHeart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">No hay actividades activas</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">Crea eventos para fomentar la comunión.</p>
                            {isAdminOrAuditor && (
                                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                                    Crear actividad
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <ProgramDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSuccess={() => mutate()}
                    defaultType={PROGRAM_TYPE}
                />

                {selectedProgramId && (
                    <JoinFamilyDialog
                        isOpen={isJoinDialogOpen}
                        onClose={() => {
                            setIsJoinDialogOpen(false);
                            setSelectedProgramId(null);
                        }}
                        activityId={selectedProgramId}
                        onSuccess={() => mutate()}
                    />
                )}
            </PageContainer>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará la actividad y sus datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmas que no asistirás?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Dejarás de estar inscrito.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmLeave} className="bg-orange-600 hover:bg-orange-700">
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
