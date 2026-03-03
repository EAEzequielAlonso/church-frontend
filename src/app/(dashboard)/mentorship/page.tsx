'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    HeartHandshake,
    GraduationCap,
    UserPlus,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useMentorshipList } from '@/modules/mentorship/hooks/use-mentorship-list';
import { MentorshipType, MentorshipStatus } from '@/modules/mentorship/types/mentorship.types';

export default function MentorshipListPage() {
    const router = useRouter();

    // Filtros de estado
    const [page, setPage] = useState(1);
    const [type, setType] = useState<MentorshipType | 'ALL'>('ALL');
    const [status, setStatus] = useState<MentorshipStatus | 'ALL'>('ALL');
    const limit = 10;

    // Fetching de datos
    const { data, total, isLoading, isError } = useMentorshipList({
        page,
        limit,
        type: type !== 'ALL' ? type : undefined,
        status: status !== 'ALL' ? status : undefined
    });

    const totalPages = Math.ceil(total / limit) || 1;

    // Handlers
    const handleTypeChange = (newType: string) => {
        setType(newType as MentorshipType | 'ALL');
        setPage(1); // Reset de página al cambiar filtro
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus as MentorshipStatus | 'ALL');
        setPage(1); // Reset de página al cambiar filtro
    };

    // Helpers UI
    const getTypeConfig = (t: MentorshipType) => {
        switch (t) {
            case 'DISCIPLESHIP':
                return { label: 'Discipulado', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', icon: GraduationCap };
            case 'COUNSELING':
                return { label: 'Consejería', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100', icon: HeartHandshake };
            case 'FOLLOW_UP':
                return { label: 'Seguimiento', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', icon: UserPlus };
            default:
                return { label: 'Desconocido', color: 'bg-slate-100 text-slate-700', icon: Calendar };
        }
    };

    const getStatusConfig = (s: MentorshipStatus) => {
        switch (s) {
            case 'ACTIVE':
                return { label: 'Activo', color: 'bg-green-100 text-green-800 border-green-200' };
            case 'PAUSED':
                return { label: 'Pausado', color: 'bg-amber-100 text-amber-800 border-amber-200' };
            case 'CLOSED':
                return { label: 'Cerrado', color: 'bg-slate-100 text-slate-800 border-slate-200' };
            default:
                return { label: s, color: 'bg-slate-100 text-slate-800 border-slate-200' };
        }
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Acompañamiento</h2>
                    <p className="text-slate-500 mt-1">Gestiona los procesos de cuidado, consejería y discipulado.</p>
                </div>
                <Button onClick={() => router.push('/mentorship/new')} className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4">
                    Nuevo Proceso
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Tabs value={type} onValueChange={handleTypeChange} className="w-full sm:w-auto">
                    <TabsList className="grid grid-cols-4 w-full h-10 sm:w-auto bg-slate-100/50 border border-slate-200">
                        <TabsTrigger value="ALL" className="text-xs sm:text-sm font-medium">Todos</TabsTrigger>
                        <TabsTrigger value="DISCIPLESHIP" className="text-xs sm:text-sm font-medium">Discipulados</TabsTrigger>
                        <TabsTrigger value="COUNSELING" className="text-xs sm:text-sm font-medium">Consejería</TabsTrigger>
                        <TabsTrigger value="FOLLOW_UP" className="text-xs sm:text-sm font-medium">Seguimiento</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="w-full sm:w-[200px]">
                    <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Estado..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Cualquier Estado</SelectItem>
                            <SelectItem value="ACTIVE">Activos</SelectItem>
                            <SelectItem value="CLOSED">Cerrados</SelectItem>
                            <SelectItem value="PAUSED">Pausados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Listado */}
            <div className="space-y-4">
                {isLoading ? (
                    // Skeleton State
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-[104px] w-full rounded-xl bg-slate-100 animate-pulse border border-slate-200"></div>
                    ))
                ) : isError ? (
                    <div className="p-8 border rounded-xl border-dashed border-red-200 bg-red-50 flex flex-col items-center justify-center">
                        <p className="text-red-600 font-medium">Error al cargar los procesos.</p>
                        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Reintentar</Button>
                    </div>
                ) : data.length === 0 ? (
                    <div className="p-12 border rounded-xl border-dashed bg-slate-50 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                            <HeartHandshake className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No hay procesos</h3>
                        <p className="text-slate-500 mt-1 max-w-sm">No se encontraron procesos de acompañamiento que coincidan con los filtros actuales.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {data.map((process) => {
                            const config = getTypeConfig(process.type);
                            const statusConfig = getStatusConfig(process.status);
                            const Icon = config.icon;

                            return (
                                <Card
                                    key={process.id}
                                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-slate-200 group"
                                    onClick={() => router.push(`/mentorship/${process.id}`)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <div className="p-6 flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`font-semibold px-2 py-0.5 shadow-none ${config.color}`} variant="outline">
                                                        <Icon className="w-3.5 h-3.5 mr-1.5" />
                                                        {config.label}
                                                    </Badge>
                                                    <Badge className="font-semibold px-2 bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none border-none">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {format(new Date(process.createdAt), "d MMM yyyy", { locale: es })}
                                                    </Badge>
                                                </div>
                                                <Badge variant="outline" className={`font-bold ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mentor / Guía</p>
                                                    <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                        {process.mentor?.name || 'Sin Asignar'}
                                                    </p>
                                                </div>
                                                <div className="hidden sm:block text-slate-300">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Persona Guiada</p>
                                                    <p className="font-medium text-slate-700">
                                                        {process.mentee?.name || 'Varios/Ninguno'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 border-t sm:border-t-0 sm:border-l border-slate-100 p-4 sm:p-6 sm:w-48 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                            <Button variant="ghost" className="w-full text-slate-600 group-hover:text-primary hover:bg-transparent">
                                                Abrir Detalle
                                                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Paginación */}
            {data.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-500">
                        Página {page} de {totalPages} <span className="text-slate-400">({total} resultados)</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className="h-8"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isLoading}
                            className="h-8"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
