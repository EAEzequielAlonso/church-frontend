'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle, Trash2, Phone, Mail, Calendar, User, MoreVertical, EyeOff } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FollowUpCardProps {
    person: any;
    onAssign: (person: any) => void;
    onStatusChange: (id: string, status: string) => void;
    onDelete?: (person: any) => void; // Optional for backward compatibility or strict typing
}

export default function FollowUpCard({ person, onAssign, onStatusChange, onDelete }: FollowUpCardProps) {
    const { user } = useAuth();

    // Permission Logic
    const canManage = user?.roles?.some(r => ['ADMIN_APP', 'PASTOR', 'DEACON'].includes(r));

    // Status Badge
    const getStatusBadge = () => {
        switch (person.status) {
            case 'ACTIVE': return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Activo</Badge>;
            case 'FINISHED': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Finalizado</Badge>;
            case 'HIDDEN': return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Oculto</Badge>;
            default: return null;
        }
    };

    return (
        <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-indigo-500">
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">{person.firstName} {person.lastName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge()}
                            <span className="text-xs text-slate-400">Creado el {format(new Date(person.createdAt), "d MMM", { locale: es })}</span>
                        </div>
                    </div>

                    {/* Management Menu - Only for Admins/Pastors */}
                    {canManage && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Gestión Pastoral</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onAssign(person)}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {person.assignedMember ? 'Reasignar Responsable' : 'Asignar Responsable'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {person.status !== 'FINISHED' && (
                                    <DropdownMenuItem onClick={() => onStatusChange(person.id, 'FINISHED')} className="text-emerald-700">
                                        <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Seguimiento
                                    </DropdownMenuItem>
                                )}
                                {person.status === 'FINISHED' && (
                                    <DropdownMenuItem onClick={() => onStatusChange(person.id, 'ACTIVE')}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Reactivar
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {person.status !== 'HIDDEN' ? (
                                    <DropdownMenuItem onClick={() => onStatusChange(person.id, 'HIDDEN')} className="text-slate-500">
                                        <EyeOff className="mr-2 h-4 w-4" /> Ocultar
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={() => onStatusChange(person.id, 'ACTIVE')}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Mostrar
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <DropdownMenuItem onClick={() => onDelete(person)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Definitivamente
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                    {person.phone && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Phone className="w-4 h-4 mr-2 text-slate-400" />
                            {person.phone}
                        </div>
                    )}
                    {person.email && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Mail className="w-4 h-4 mr-2 text-slate-400" />
                            {person.email}
                        </div>
                    )}
                    {person.firstVisitDate && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                            Visita: {format(new Date(person.firstVisitDate), "d MMM yyyy", { locale: es })}
                        </div>
                    )}
                </div>

                {/* Assigned Member Section */}
                <div className="pt-4 border-t border-slate-100 mt-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Responsable Asignado</p>
                    {person.assignedMember ? (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={person.assignedMember.person?.avatarUrl} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                    {person.assignedMember.person?.firstName?.[0]}{person.assignedMember.person?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-sm font-medium text-slate-700">
                                {person.assignedMember.person?.firstName} {person.assignedMember.person?.lastName}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                            <User className="w-4 h-4" />
                            Sin asignar
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
