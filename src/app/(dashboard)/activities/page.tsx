'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Map, Users, Calendar, Flag, Eye, Share2, MoreVertical, Trash2, PauseCircle, PlayCircle, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PageContainer from '@/components/ui/PageContainer';
import useSWR from 'swr';
import api from '@/lib/api';
import CourseDialog from '@/components/courses/CourseDialog';
import { useAuth } from '@/context/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function ActivitiesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

    // State for Leave Confirmation
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [activityToLeave, setActivityToLeave] = useState<string | null>(null);

    // Fetch courses with type=ACTIVITY
    const { data: activities, mutate } = useSWR('/courses?type=ACTIVITY', async (url) => (await api.get(url)).data);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'SUSPENDED': return 'bg-red-100 text-red-700 border-red-200';
            case 'COMPLETED': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'DRAFT': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'ACTIVO';
            case 'SUSPENDED': return 'SUSPENDIDO';
            case 'COMPLETED': return 'COMPLETADO';
            case 'DRAFT': return 'BORRADOR';
            default: return status;
        }
    };

    const isAdminOrAuditor = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';

    const handleShare = (activity: any) => {
        const text = `Te invito a la actividad "${activity.title}". ${activity.description || ''}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleDeleteClick = (id: string) => {
        setActivityToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!activityToDelete) return;
        try {
            await api.delete(`/courses/${activityToDelete}`);
            toast.success('Actividad eliminada');
            mutate();
        } catch (error) {
            toast.error('Error al eliminar actividad');
        } finally {
            setDeleteConfirmOpen(false);
            setActivityToDelete(null);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/courses/${id}`, { status: newStatus });
            toast.success(`Actividad ${newStatus === 'ACTIVE' ? 'reactivada' : 'suspendida'}`);
            mutate();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    const handleJoinClick = async (activityId: string) => {
        if (!user?.memberId) {
            toast.error('Debes tener un perfil de miembro asociado para inscribirte.');
            return;
        }

        try {
            const res = await api.get('/families/my-family');
            if (res.data) {
                // Has family -> Open Dialog
                setSelectedActivityId(activityId);
                setIsJoinDialogOpen(true);
            } else {
                // No family -> Join directly (self)
                toast.promise(
                    api.post(`/courses/${activityId}/join`, { memberIds: [user.memberId] }),
                    {
                        loading: 'Inscribiéndote...',
                        success: () => {
                            mutate();
                            return '¡Te has sumado a la actividad!';
                        },
                        error: 'Error al inscribirse'
                    }
                );
            }
        } catch (error) {
            console.error('Error searching family:', error);
            // Fallback to self join if family check fails
            toast.promise(
                api.post(`/courses/${activityId}/join`, { memberIds: [user.memberId] }),
                {
                    loading: 'Inscribiéndote...',
                    success: () => {
                        mutate();
                        return '¡Te has sumado a la actividad!';
                    },
                    error: 'Error al inscribirse'
                }
            );
        }
    };

    const handleLeaveClick = (activityId: string) => {
        setActivityToLeave(activityId);
        setLeaveConfirmOpen(true);
    };

    const confirmLeave = async () => {
        if (!activityToLeave) return;

        toast.promise(
            api.post(`/courses/${activityToLeave}/leave`),
            {
                loading: 'Procesando...',
                success: () => {
                    mutate();
                    return 'Ya no estás anotado.';
                },
                error: 'Error al salir de la actividad'
            }
        );
        setLeaveConfirmOpen(false);
        setActivityToLeave(null);
    };

    return (
        <>
            <PageContainer title="Actividades Comunitarias" description="Gestión de eventos, salidas y vida en comunidad">
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
                    {activities?.map((activity: any) => {
                        const isEnrolled = activity.participants?.some((p: any) => p.member.id === user?.memberId);

                        return (
                            <Card
                                key={activity.id}
                                className="group hover:shadow-lg transition-all duration-300 border-t-4 overflow-hidden flex flex-col"
                                style={{ borderTopColor: activity.color || '#10b981' }}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge variant="outline" className={`mb-2 font-bold ${getStatusColor(activity.status)}`}>
                                                {getStatusLabel(activity.status)}
                                            </Badge>
                                            <CardTitle className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                                {activity.title}
                                            </CardTitle>
                                        </div>
                                        {isAdminOrAuditor && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {activity.status !== 'SUSPENDED' ? (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(activity.id, 'SUSPENDED')} className="text-amber-600">
                                                            <PauseCircle className="mr-2 h-4 w-4" /> Suspender
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(activity.id, 'ACTIVE')} className="text-emerald-600">
                                                            <PlayCircle className="mr-2 h-4 w-4" /> Reactivar
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(activity.id)} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                                            {activity.description || 'Sin descripción disponible.'}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                                <span>
                                                    {activity.startDate
                                                        ? format(new Date(activity.startDate + 'T12:00:00'), "d MMM yyyy", { locale: es })
                                                        : 'Sin fecha'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-emerald-500" />
                                                <span>
                                                    {activity.participants?.length || 0}
                                                    {activity.capacity && activity.capacity > 0 ? ` / ${activity.capacity}` : ''} participantes
                                                </span>
                                            </div>
                                            {activity.category && (
                                                <div className="flex items-center gap-2 col-span-2">
                                                    <Flag className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="uppercase tracking-wider font-bold text-[10px]">{activity.category}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-4 pt-0 mt-auto flex gap-3">
                                    <div className="flex gap-2 w-full">
                                        {isEnrolled ? (
                                            <Button
                                                onClick={() => handleLeaveClick(activity.id)}
                                                className="flex-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors"
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                No voy
                                            </Button>
                                        ) : (
                                            <Button
                                                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all"
                                                onClick={() => handleJoinClick(activity.id)}
                                                disabled={activity.status !== 'ACTIVE'}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Me Sumo
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="px-3 border-slate-200 hover:bg-slate-50 text-slate-600"
                                            onClick={() => router.push(`/activities/${activity.id}`)}
                                            title="Ver Detalles"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="px-3 bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            onClick={() => handleShare(activity)}
                                            title="Compartir"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent w-0 group-hover:w-full transition-all duration-700" />
                            </Card>
                        );
                    })}

                    {(!activities || activities.length === 0) && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <Map className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">No hay actividades activas</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">Comienza creando una salida, evento o jornada comunitaria para la iglesia.</p>
                            {isAdminOrAuditor && (
                                <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                    Crear mi primera actividad
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <CourseDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSuccess={() => mutate()}
                    defaultType="ACTIVITY" // Pass defaultType
                />

                {selectedActivityId && (
                    <JoinFamilyDialog
                        isOpen={isJoinDialogOpen}
                        onClose={() => {
                            setIsJoinDialogOpen(false);
                            setSelectedActivityId(null);
                        }}
                        activityId={selectedActivityId}
                        onSuccess={() => mutate()}
                    />
                )}
            </PageContainer >

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la actividad y todos sus datos asociados, incluyendo registros de asistencia.
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
                            Dejarás de estar inscrito en esta actividad.
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
