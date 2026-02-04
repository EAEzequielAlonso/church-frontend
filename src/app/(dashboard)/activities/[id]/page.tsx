'use client';

import { useParams } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, Settings, Loader2, Users } from 'lucide-react';
import useSWR from 'swr';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
// Reuse unified components
import SessionList from '@/components/courses/SessionList';
import ParticipantList from '@/components/courses/ParticipantList';
import CourseDialog from '@/components/courses/CourseDialog';
import { useAuth } from '@/context/AuthContext';

export default function ActivityDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const isAdminOrAuditor = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';

    // Fetch from /courses/:id (Unified endpoint)
    const { data: activity, mutate, isLoading } = useSWR(id ? `/courses/${id}` : null, async (url) => (await api.get(url)).data);

    // Helper functions for status
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

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
    if (!activity) return <div className="p-8">Actividad no encontrada</div>;

    return (
        <PageContainer
            title={activity.title} // Used to be 'name', now 'title'
            description={activity.category || 'Actividad Comunitaria'}
            headerAction={
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-lg px-3 py-1 uppercase tracking-widest ${getStatusColor(activity.status)}`}>
                        {getStatusLabel(activity.status)}
                    </Badge>
                    {isAdminOrAuditor && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                            <Settings className="w-4 h-4 mr-2" /> Editar
                        </Button>
                    )}
                    <CourseDialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        courseToEdit={activity}
                        onSuccess={mutate}
                        defaultType="ACTIVITY"
                    />
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-t-4 shadow-sm" style={{ borderTopColor: activity.color }}>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {activity.description || 'Sin descripción detallada.'}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                                {activity.startDate && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                        <span>Inicia: <strong>{format(new Date(activity.startDate + 'T12:00:00'), "d MMMM", { locale: es })}</strong></span>
                                    </div>
                                )}
                                {activity.endDate && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span>Finaliza: <strong>{format(new Date(activity.endDate + 'T12:00:00'), "d MMMM", { locale: es })}</strong></span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Users className="w-4 h-4 text-emerald-500" />
                                    <span>Cupo: <strong>{activity.capacity ? activity.capacity : 'Ilimitado'}</strong></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="sessions" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="sessions">Cronograma</TabsTrigger>
                            <TabsTrigger value="participants">Participantes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="sessions">
                            {/* Reuse SessionList (Generic) */}
                            <SessionList course={activity} refresh={mutate} />
                        </TabsContent>

                        <TabsContent value="participants">
                            {/* Reuse ParticipantList (Generic) */}
                            <ParticipantList course={activity} refresh={mutate} />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-50 border-none shadow-inner">
                        <CardHeader>
                            <CardTitle className="text-base text-slate-800">Resumen de la Actividad</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                <span className="text-sm font-bold text-emerald-600">Total Inscritos</span>
                                <span className="text-2xl font-black text-emerald-900">{(activity.participants?.length || 0) + (activity.guests?.length || 0)} <span className="text-xs text-slate-400 font-normal">/ {activity.capacity || '♾️'}</span></span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-100 items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Miembros</span>
                                    <span className="text-xl font-bold text-slate-700">{activity.participants?.length || 0}</span>
                                </div>
                                <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-100 items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Visitantes</span>
                                    <span className="text-xl font-bold text-slate-700">{activity.guests?.filter((g: any) => g.followUpPerson).length || 0}</span>
                                </div>
                                <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-100 items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Invitados</span>
                                    <span className="text-xl font-bold text-slate-700">{activity.guests?.filter((g: any) => !g.followUpPerson).length || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
}
