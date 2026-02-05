'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MoreVertical, Trash2, PauseCircle, PlayCircle, Eye, Share2, UserCheck, Plus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProgramDto } from '../types/program.types';

interface ProgramCardProps {
    program: ProgramDto;
    isAdminOrAuditor: boolean;
    isEnrolled: boolean;
    onStatusChange: (id: string, status: any) => void;
    onDelete: (id: string) => void;
    onJoin: (id: string) => void;
    onLeave: (id: string) => void;
    onViewStart: (id: string) => void;
    onShare: (program: ProgramDto) => void;
}

export default function ProgramCard({
    program,
    isAdminOrAuditor,
    isEnrolled,
    onStatusChange,
    onDelete,
    onJoin,
    onLeave,
    onViewStart,
    onShare
}: ProgramCardProps) {
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

    return (
        <Card
            className="group hover:shadow-lg transition-all duration-300 border-t-4 overflow-hidden flex flex-col"
            style={{ borderTopColor: program.color || '#6366f1' }}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className={`mb-2 font-bold ${getStatusColor(program.status)}`}>
                            {getStatusLabel(program.status)}
                        </Badge>
                        <CardTitle className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {program.title}
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
                                {program.status !== 'SUSPENDED' ? (
                                    <DropdownMenuItem onClick={() => onStatusChange(program.id, 'SUSPENDED')} className="text-amber-600">
                                        <PauseCircle className="mr-2 h-4 w-4" /> Suspender
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={() => onStatusChange(program.id, 'ACTIVE')} className="text-emerald-600">
                                        <PlayCircle className="mr-2 h-4 w-4" /> Reactivar
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => onDelete(program.id)} className="text-red-600">
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
                        {program.description || 'Sin descripción disponible.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{format(new Date(program.startDate + 'T12:00:00'), "d MMM yyyy", { locale: es })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            <span>
                                {program.participants?.length || 0}
                                {program.capacity && program.capacity > 0 ? ` / ${program.capacity}` : ''} inscritos
                            </span>
                        </div>
                        {program.category && (
                            <div className="flex items-center gap-2 col-span-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                <span className="uppercase tracking-wider font-bold text-[10px]">{program.category}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <div className="p-4 pt-0 mt-auto flex gap-3">
                <div className="flex gap-2 w-full">
                    {isEnrolled ? (
                        <Button
                            onClick={() => onLeave(program.id)}
                            className="flex-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors"
                        >
                            <UserCheck className="w-4 h-4 mr-2" />
                            No voy
                        </Button>
                    ) : (
                        <Button
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
                            onClick={() => onJoin(program.id)}
                            disabled={program.status !== 'ACTIVE'}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Me Sumo
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="px-3 border-slate-200 hover:bg-slate-50 text-slate-600"
                        onClick={() => onViewStart(program.id)}
                        title="Ver Detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        className="px-3 bg-slate-100 text-slate-600 hover:bg-slate-200"
                        onClick={() => onShare(program)}
                        title="Compartir"
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent w-0 group-hover:w-full transition-all duration-700" />
        </Card>
    );
}
