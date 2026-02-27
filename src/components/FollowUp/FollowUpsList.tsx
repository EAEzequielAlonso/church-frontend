import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FollowUpPerson } from '@/hooks/useFollowUps';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Phone, Mail, UserCheck, Trash2, Edit, Archive, UserPlus, FileText, UserCog } from 'lucide-react';
import { SystemRole, FunctionalRole } from '@/types/auth-types';

interface FollowUpsListProps {
    data: FollowUpPerson[];
    loading: boolean;
    onAction: (type: 'EDIT' | 'ARCHIVE' | 'PROMOTE' | 'DELETE' | 'ASSIGN', item: FollowUpPerson) => void;
}

export function FollowUpsList({ data, loading, onAction }: FollowUpsListProps) {
    const { user } = useAuth();

    const canManage = user?.roles?.includes(FunctionalRole.ADMIN_CHURCH) ||
        user?.roles?.includes(FunctionalRole.AUDITOR) ||
        user?.systemRole === SystemRole.ADMIN_APP;

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando lista...</div>;
    }

    if (data.length === 0) {
        return (
            <div className="p-8 text-center border rounded-md bg-muted/10">
                <p className="text-muted-foreground">No se encontraron registros con los filtros actuales.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Nombre Completo</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead className="w-[100px]">Estado</TableHead>
                        <TableHead>Asignado A</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((person) => (
                        <TableRow key={person.id} className="hover:bg-muted/5 transition-colors">
                            <TableCell className="font-semibold text-slate-800">
                                <div>{person.firstName} {person.lastName}</div>
                                <div className="text-xs text-muted-foreground font-normal">
                                    Desde {format(new Date(person.createdAt), 'dd MMM yyyy', { locale: es })}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 text-sm text-slate-500">
                                    {person.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {person.email}
                                        </div>
                                    )}
                                    {person.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {person.phone}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`${getStatusColor(person.status)} border-0 font-medium`}>
                                    {getStatusLabel(person.status)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {person.assignedMember?.person ? (
                                    <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                                        <UserCheck className="w-4 h-4" />
                                        {person.assignedMember.person.firstName} {person.assignedMember.person.lastName}
                                    </div>
                                ) : (
                                    <span className="text-slate-400 text-sm italic">-- Sin asignar --</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                                        <DropdownMenuItem asChild>
                                            <Link href={`/visitors/${person.id}`} className="cursor-pointer">
                                                <FileText className="mr-2 h-4 w-4" /> Ver Bitácora / Detalles
                                            </Link>
                                        </DropdownMenuItem>

                                        {canManage && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onAction('EDIT', person)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Editar Información
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAction('ASSIGN', person)}>
                                                    <UserCog className="mr-2 h-4 w-4" /> Asignar Responsable
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAction('PROMOTE', person)}>
                                                    <UserPlus className="mr-2 h-4 w-4 text-green-600" /> Promover a Miembro
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAction('ARCHIVE', person)}>
                                                    <Archive className="mr-2 h-4 w-4 text-orange-500" /> Archivar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onAction('DELETE', person)} className="text-red-600 focus:text-red-700">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'VISITOR': return 'bg-blue-100 text-blue-700';
        case 'PROSPECT': return 'bg-emerald-100 text-emerald-700';
        case 'ARCHIVED': return 'bg-slate-100 text-slate-600';
        default: return 'bg-gray-100 text-gray-700';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'VISITOR': return 'Visitante';
        case 'PROSPECT': return 'Prospecto';
        case 'ARCHIVED': return 'Archivado';
        default: return status;
    }
}
