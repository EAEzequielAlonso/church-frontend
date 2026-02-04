'use client';

import { useParams } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, MapPin, CheckCircle, BookOpen, Plus, MoreHorizontal, Settings } from 'lucide-react';
import useSWR from 'swr';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import SessionList from '@/components/courses/SessionList';
import ParticipantList from '@/components/courses/ParticipantList';
import CourseDialog from '@/components/courses/CourseDialog';

export default function CourseDetailPage() {
    const { id } = useParams();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { data: course, isLoading, mutate } = useSWR(id ? `/courses/${id}` : null, async (url) => (await api.get(url)).data);

    if (isLoading) return <PageContainer title="Cargando..." description=""><Skeleton className="h-[200px] w-full" /></PageContainer>;
    if (!course) return <PageContainer title="Error" description=""><p>No se encontró el curso.</p></PageContainer>;

    return (
        <PageContainer
            title={course.title}
            description={course.category || 'Curso de Formación'}
            headerAction={
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-lg px-3 py-1 uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-200">
                        {course.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)} className="flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Configuración
                    </Button>
                    <CourseDialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        courseToEdit={course}
                        onSuccess={mutate}
                    />
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT: MAIN CONTENT */}
                <div className="md:col-span-2 space-y-6">
                    {/* INFO CARD */}
                    <Card className="border-t-4 shadow-sm" style={{ borderTopColor: course.color }}>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {course.description || 'Sin descripción detallada.'}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    <span>Inicio: <strong>{format(new Date(course.startDate + 'T12:00:00'), "d MMMM yyyy", { locale: es })}</strong></span>
                                </div>
                                {course.endDate && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <CheckCircle className="w-4 h-4 text-indigo-500" />
                                        <span>Fin: <strong>{format(new Date(course.endDate + 'T12:00:00'), "d MMMM yyyy", { locale: es })}</strong></span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Users className="w-4 h-4 text-indigo-500" />
                                    <span>Cupo: <strong>{course.capacity ? course.capacity : 'Ilimitado'}</strong></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TABS FOR SESSIONS & PARTICIPANTS */}
                    <Tabs defaultValue="sessions" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="sessions">Encuentros y Programa</TabsTrigger>
                            <TabsTrigger value="participants">Participantes e Invitados</TabsTrigger>
                        </TabsList>

                        <TabsContent value="sessions">
                            <SessionList course={course} refresh={mutate} />
                        </TabsContent>

                        <TabsContent value="participants">
                            <ParticipantList course={course} refresh={mutate} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* RIGHT: SUMMARY & ACTIONS */}
                <div className="space-y-6">
                    <Card className="bg-slate-50 border-none shadow-inner">
                        <CardHeader>
                            <CardTitle className="text-base text-slate-800">Resumen del Taller</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                <span className="text-sm font-bold text-indigo-600">Cupo Total</span>
                                <span className="text-2xl font-black text-indigo-900">{(course.participants?.length || 0) + (course.guests?.length || 0)} <span className="text-xs text-slate-400 font-normal">/ {course.capacity || '♾️'}</span></span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-100 items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Miembros</span>
                                    <span className="text-xl font-bold text-slate-700">{course.participants?.length || 0}</span>
                                </div>
                                <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-100 items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Visitantes</span>
                                    <span className="text-xl font-bold text-slate-700">{course.guests?.filter((g: any) => g.followUpPerson).length || 0}</span>
                                </div>
                                <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-100 items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Invitados</span>
                                    <span className="text-xl font-bold text-slate-700">{course.guests?.filter((g: any) => !g.followUpPerson).length || 0}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                <span className="text-sm text-slate-500">Sesiones Programadas</span>
                                <span className="text-xl font-bold text-slate-800">{course.sessions?.length || 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* INSTRUCTOR CARD (Mockup for now) */}
                    {course.createdBy && (
                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-white">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {course.createdBy.person?.firstName?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase">Creado por</p>
                                <p className="text-sm font-semibold text-slate-800">{course.createdBy.person?.fullName}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
