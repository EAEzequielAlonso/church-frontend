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
    ArrowRight,
    Building2,
    Coffee,
    Check,
    X,
    Info,
    ShieldAlert
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
import { useMentorshipInvitations } from '@/modules/mentorship/hooks/use-mentorship-invitations';
import { mentorshipService } from '@/modules/mentorship/services/mentorship.service';
import { MentorshipType, MentorshipStatus, MentorshipMode, MentorshipParticipant } from '@/modules/mentorship/types/mentorship.types';
import { toast } from 'sonner';

export default function MentorshipListPage() {
    const router = useRouter();

    // Filtros de estado
    const [page, setPage] = useState(1);
    const [type, setType] = useState<MentorshipType | 'ALL'>('ALL');
    const [status, setStatus] = useState<MentorshipStatus | 'ALL'>('ALL');
    const limit = 10;

    // Fetching de datos
    const { 
        data: mentorships, 
        total, 
        isLoading, 
        isError, 
        mutate: mutateList 
    } = useMentorshipList({
        page,
        limit,
        type: type !== 'ALL' ? type : undefined,
        status: status !== 'ALL' ? status : undefined
    });

    const { 
        data: invitations, 
        isLoading: invitationsLoading, 
        mutate: mutateInvitations 
    } = useMentorshipInvitations();

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

    const handleAccept = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const invitation = invitations.find(i => i.id === id);
            const myParticipation = invitation?.participants?.find((p: MentorshipParticipant) => p.status === 'PENDING');
            
            if (!myParticipation) throw new Error('No se encontró tu participación pendiente.');

            await mentorshipService.acceptParticipation(myParticipation.id);
            toast.success('Invitación aceptada correctamente');
            mutateInvitations();
            mutateList();
        } catch (error) {
            toast.error('Error al aceptar la invitación');
        }
    };

    const handleDecline = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('¿Estás seguro de que deseas rechazar esta invitación?')) return;
        
        try {
            const invitation = invitations.find(i => i.id === id);
            const myParticipation = invitation?.participants?.find((p: MentorshipParticipant) => p.status === 'PENDING');
            
            if (!myParticipation) throw new Error('No se encontró tu participación pendiente.');

            await mentorshipService.declineParticipation(myParticipation.id);
            toast.success('Invitación rechazada');
            mutateInvitations();
            mutateList();
        } catch (error) {
            toast.error('Error al rechazar la invitación');
        }
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

    const getModeConfig = (m: MentorshipMode | undefined) => {
        if (m === 'FORMAL') {
            return { label: 'Formal', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200', icon: Building2 };
        }
        return { label: 'Informal', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200', icon: Coffee };
    };

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Acompañamiento</h2>
                    <p className="text-slate-500 mt-1">Gestiona los procesos de cuidado, consejería y discipulado.</p>
                </div>
                <Button onClick={() => router.push('/mentorship/new')} className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4">
                    Nuevo Proceso
                </Button>
            </div>

            {/* SECCIÓN DE INVITACIONES */}
            {invitationsLoading ? (
                <div className="space-y-4">
                    <div className="h-6 w-48 bg-slate-100 animate-pulse rounded-md"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-24 w-full bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>
                        <div className="h-24 w-full bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>
                    </div>
                </div>
            ) : invitations.length > 0 ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <h3 className="text-lg font-bold text-slate-800">Invitaciones Pendientes</h3>
                        <Badge className="ml-2 bg-amber-100 text-amber-700 border-amber-200">{invitations.length}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {invitations.map((inv) => {
                            const config = getTypeConfig(inv.type);
                            const Icon = config.icon;
                            return (
                                <Card key={inv.id} className="border-amber-200 bg-amber-50/30 overflow-hidden group shadow-sm hover:shadow-md transition-all">
                                    <div className="p-5 flex flex-col sm:flex-row items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${config.color.split(' ')[0]} ${config.color.split(' ')[1]}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider border-none ${config.color}`}>{config.label}</Badge>
                                                <span className="text-[11px] text-amber-600 font-bold uppercase tracking-widest">{inv.mode}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 truncate mb-1">{inv.motive || 'Proceso de Mentoría'}</h4>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Invitación de: <span className="text-slate-900 font-bold">{inv.mentorSummary || 'Mentor'}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 self-center sm:self-start">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-9 w-9 p-0 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={(e) => handleDecline(inv.id, e)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-9 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                                                onClick={(e) => handleAccept(inv.id, e)}
                                            >
                                                <Check className="w-3.5 h-3.5 mr-1.5" />
                                                Aceptar
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            ) : null}

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-800">Mis Acompañamientos</h3>
                        {!isLoading && mentorships.length > 0 && (
                             <Badge variant="secondary" className="bg-slate-100 text-slate-600">{total}</Badge>
                        )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Tabs value={type} onValueChange={handleTypeChange} className="w-full sm:w-auto">
                            <TabsList className="grid grid-cols-4 w-full h-10 sm:w-auto bg-slate-100/50 border border-slate-200">
                                <TabsTrigger value="ALL" className="text-xs sm:text-sm font-medium">Todos</TabsTrigger>
                                <TabsTrigger value="DISCIPLESHIP" className="text-xs sm:text-sm font-medium">Discipulados</TabsTrigger>
                                <TabsTrigger value="COUNSELING" className="text-xs sm:text-sm font-medium">Consejería</TabsTrigger>
                                <TabsTrigger value="FOLLOW_UP" className="text-xs sm:text-sm font-medium">Seguimiento</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="w-full sm:w-[180px]">
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="bg-white h-10">
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
                            <ShieldAlert className="w-8 h-8 text-red-400 mb-2" />
                            <p className="text-red-600 font-medium">Error al cargar los procesos.</p>
                            <Button variant="outline" className="mt-4" onClick={() => mutateList()}>Reintentar</Button>
                        </div>
                    ) : mentorships.length === 0 ? (
                        <div className="p-12 border rounded-xl border-dashed bg-slate-50 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                                <Info className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No hay procesos activos</h3>
                            <p className="text-slate-500 mt-1 max-w-sm">No se encontraron procesos de acompañamiento que coincidan con los filtros actuales.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mentorships.map((process) => {
                                const config = getTypeConfig(process.type);
                                const statusConfig = getStatusConfig(process.status);
                                const Icon = config.icon;

                                return (
                                    <Card
                                        key={process.id}
                                        className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200 group flex flex-col h-full bg-white hover:-translate-y-1"
                                        onClick={() => router.push(`/mentorship/${process.id}`)}
                                    >
                                        <div className="p-6 flex flex-col flex-1 space-y-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge className={`font-semibold px-2 py-0.5 shadow-none ${config.color}`} variant="outline">
                                                        <Icon className="w-3.5 h-3.5 mr-1" />
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                <Badge variant="outline" className={`font-bold shrink-0 ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-col flex-1 mt-1 justify-between">
                                                <div className="mb-4">
                                                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                                                        {process.motive || 'Proceso de Mentoría'}
                                                    </h3>
                                                </div>

                                                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-auto">
                                                    <div className="flex-1 min-w-0 pr-2 border-r border-slate-200 flex items-center gap-2.5" title={process.mentorSummary || 'Sin Asignar'}>
                                                        <div className="w-7 h-7 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                                                            {process.mentorSummary?.charAt(0) || 'M'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 leading-none">Mentor</p>
                                                            <p className="font-bold text-slate-800 text-xs truncate group-hover:text-primary transition-colors">
                                                                {process.mentorSummary || 'Sin Asignar'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0 pl-3 flex items-center gap-2.5" title={process.menteeSummary || 'Varios'}>
                                                        <div className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px]">
                                                            {process.menteeSummary?.charAt(0) || 'G'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 leading-none">Guiado</p>
                                                            <p className="font-medium text-slate-700 text-xs truncate">
                                                                {process.menteeSummary || 'Varios/Ninguno'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                                                    {(() => {
                                                        const modeConfig = getModeConfig(process.mode);
                                                        const ModeIcon = modeConfig.icon;
                                                        return (
                                                            <Badge variant="outline" className={`font-semibold px-2.5 py-0.5 shadow-none text-[10px] uppercase tracking-wider flex items-center gap-1.5 ${modeConfig.color}`}>
                                                                <ModeIcon className="w-3 h-3" />
                                                                {modeConfig.label}
                                                            </Badge>
                                                        );
                                                    })()}
                                                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        {format(new Date(process.createdAt), "d MMM yyyy", { locale: es })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 border-t border-slate-100 p-4 transition-colors group-hover:bg-primary/5 mt-auto">
                                            <div className="flex items-center justify-between text-sm font-bold text-slate-600 group-hover:text-primary">
                                                <span>Ver detalle del proceso</span>
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Paginación */}
            {mentorships.length > 0 && totalPages > 1 && (
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
