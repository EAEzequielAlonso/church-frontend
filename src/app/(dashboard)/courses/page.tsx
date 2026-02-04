'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, BookOpen, Users, Calendar, MoreVertical, Trash2, PauseCircle, PlayCircle, Eye, Share2, UserCheck, Map } from 'lucide-react';
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

export default function CoursesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

    // State for Leave Confirmation
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [courseToLeave, setCourseToLeave] = useState<string | null>(null);

    const { data: courses, mutate } = useSWR('/courses?type=COURSE', async (url) => (await api.get(url)).data);

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
            case 'ACTIVE': return 'Activo';
            case 'SUSPENDED': return 'Suspendido';
            case 'COMPLETED': return 'Finalizado';
            case 'DRAFT': return 'Borrador';
            default: return status;
        }
    };

    const isAdminOrAuditor = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';

    const handleShare = (course: any) => {
        const text = `Te invito al curso "${course.title}". ${course.description || ''}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleDeleteClick = (id: string) => {
        setCourseToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            await api.delete(`/courses/${courseToDelete}`);
            toast.success('Curso eliminado');
            mutate();
        } catch (error) {
            toast.error('Error al eliminar curso');
        } finally {
            setDeleteConfirmOpen(false);
            setCourseToDelete(null);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/courses/${id}`, { status: newStatus });
            toast.success(`Curso ${newStatus === 'ACTIVE' ? 'reactivado' : 'suspendido'}`);
            mutate();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    const handleJoinClick = async (courseId: string) => {
        if (!user?.memberId) {
            toast.error('Debes tener un perfil de miembro asociado para inscribirte.');
            return;
        }

        try {
            const res = await api.get('/families/my-family');
            if (res.data) {
                // Has family -> Open Dialog
                setSelectedCourseId(courseId);
                setIsJoinDialogOpen(true);
            } else {
                // No family -> Join directly (self)
                toast.promise(
                    api.post(`/courses/${courseId}/join`, { memberIds: [user.memberId] }),
                    {
                        loading: 'Inscribiéndote...',
                        success: () => {
                            mutate();
                            return '¡Te has inscrito al curso!';
                        },
                        error: 'Error al inscribirse'
                    }
                );
            }
        } catch (error) {
            console.error('Error searching family:', error);
            // Fallback to self join if family check fails
            toast.promise(
                api.post(`/courses/${courseId}/join`, { memberIds: [user.memberId] }),
                {
                    loading: 'Inscribiéndote...',
                    success: () => {
                        mutate();
                        return '¡Te has inscrito al curso!';
                    },
                    error: 'Error al inscribirse'
                }
            );
        }
    };

    const handleLeaveClick = (courseId: string) => {
        setCourseToLeave(courseId);
        setLeaveConfirmOpen(true);
    };

    const confirmLeave = async () => {
        if (!courseToLeave) return;

        toast.promise(
            api.post(`/courses/${courseToLeave}/leave`),
            {
                loading: 'Procesando...',
                success: () => {
                    mutate();
                    return 'Ya no estás inscrito.';
                },
                error: 'Error al salir del curso'
            }
        );
        setLeaveConfirmOpen(false);
        setCourseToLeave(null);
    };

    return (
        <>
            <PageContainer title="Cursos y Talleres" description="Gestión de formación y capacitación">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Buscar curso..."
                            className="pl-9 bg-white"
                        />
                    </div>
                    {isAdminOrAuditor && (
                        <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Curso
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses?.map((course: any) => {
                        const isEnrolled = course.participants?.some((p: any) => p.member.id === user?.memberId);

                        return (
                            <Card
                                key={course.id}
                                className="group hover:shadow-lg transition-all duration-300 border-t-4 overflow-hidden flex flex-col"
                                style={{ borderTopColor: course.color || '#6366f1' }}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge variant="outline" className={`mb-2 font-bold ${getStatusColor(course.status)}`}>
                                                {getStatusLabel(course.status)}
                                            </Badge>
                                            <CardTitle className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                {course.title}
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
                                                    {course.status !== 'SUSPENDED' ? (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'SUSPENDED')} className="text-amber-600">
                                                            <PauseCircle className="mr-2 h-4 w-4" /> Suspender
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'ACTIVE')} className="text-emerald-600">
                                                            <PlayCircle className="mr-2 h-4 w-4" /> Reactivar
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(course.id)} className="text-red-600">
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
                                            {course.description || 'Sin descripción disponible.'}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>{format(new Date(course.startDate + 'T12:00:00'), "d MMM yyyy", { locale: es })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>
                                                    {course.participants?.length || 0}
                                                    {course.capacity && course.capacity > 0 ? ` / ${course.capacity}` : ''} inscritos
                                                </span>
                                            </div>
                                            {course.category && (
                                                <div className="flex items-center gap-2 col-span-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                    <span className="uppercase tracking-wider font-bold text-[10px]">{course.category}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-4 pt-0 mt-auto flex gap-3">
                                    <div className="flex gap-2 w-full">
                                        {isEnrolled ? (
                                            <Button
                                                onClick={() => handleLeaveClick(course.id)}
                                                className="flex-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors"
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                No voy
                                            </Button>
                                        ) : (
                                            <Button
                                                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
                                                onClick={() => handleJoinClick(course.id)}
                                                disabled={course.status !== 'ACTIVE'}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Me Sumo
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="px-3 border-slate-200 hover:bg-slate-50 text-slate-600"
                                            onClick={() => router.push(`/courses/${course.id}`)}
                                            title="Ver Detalles"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="px-3 bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            onClick={() => handleShare(course)}
                                            title="Compartir"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent w-0 group-hover:w-full transition-all duration-700" />
                            </Card>
                        );
                    })}

                    {(!courses || courses.length === 0) && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">No hay cursos activos</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">Comienza creando un programa de formación, taller o escuela para tu congregación.</p>
                            {isAdminOrAuditor && (
                                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                                    Crear mi primer curso
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <CourseDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSuccess={() => mutate()}
                    defaultType="COURSE"
                />

                {selectedCourseId && (
                    <JoinFamilyDialog
                        isOpen={isJoinDialogOpen}
                        onClose={() => {
                            setIsJoinDialogOpen(false);
                            setSelectedCourseId(null);
                        }}
                        activityId={selectedCourseId}
                        onSuccess={() => mutate()}
                    />
                )}
            </PageContainer>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el curso y todos sus datos asociados, incluyendo registros de asistencia.
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
                            Dejarás de estar inscrito en este curso.
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
