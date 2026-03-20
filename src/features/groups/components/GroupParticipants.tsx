import React, { useState } from 'react';
import { GroupParticipantDto, GroupType, GroupRole } from '../types/group.types';
import { getGroupTypeConfig } from '../config/group-type.config';
import { useGroupMutations } from '../hooks/useGroupMutations';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X, UserMinus, UserCheck, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { AddParticipantDialog } from './AddParticipantDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MembershipStatus } from '@/types/auth-types';
import { ROLE_UI_METADATA } from '@/constants/role-ui';

interface GroupParticipantsProps {
    participants: GroupParticipantDto[];
    groupId: string;
    isAdminOrAuditor: boolean;
    refetch: () => void;
    groupType: GroupType;
}

export function GroupParticipants({ participants, groupId, isAdminOrAuditor, refetch, groupType }: GroupParticipantsProps) {
    const config = getGroupTypeConfig(groupType);
    const { disenroll, bulkAddParticipants, updateRole } = useGroupMutations();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
    const [editingRole, setEditingRole] = useState<GroupRole>('PARTICIPANT');

    const handleBulkAdd = async (churchPersonIds: string[]) => {
        await bulkAddParticipants(groupId, churchPersonIds);
        refetch();
    };

    const handleRemove = async (churchPersonId: string) => {
        if (!confirm('¿Estás seguro de eliminar a esta persona del grupo?')) return;
        setRemovingId(churchPersonId);
        try {
            await disenroll(groupId, churchPersonId);
            refetch();
        } finally {
            setRemovingId(null);
        }
    };

    const handleStartEdit = (personId: string, currentRole: GroupRole) => {
        setEditingPersonId(personId);
        setEditingRole(currentRole);
    };

    const handleSaveRole = async (personId: string) => {
        setEditingPersonId(null);
        await updateRole(groupId, personId, editingRole);
        refetch();
    };

    const handleCancelEdit = () => {
        setEditingPersonId(null);
    };

    const getRoleBadge = (role: GroupRole) => {
        switch (role) {
            case 'COORDINATOR':
                return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600"><Shield className="w-3 h-3 mr-1" /> Coordinador</Badge>;
            case 'TEACHER':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Maestro</Badge>;
            case 'PARTICIPANT':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700">Participante</Badge>;
            default:
                return <Badge variant="outline" className="bg-slate-50 text-slate-700">{role}</Badge>;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-slate-800 tracking-tight">Directorio de Inscritos ({participants.length})</h3>
                {isAdminOrAuditor && (
                    <Button variant="outline" size="sm" className="h-8 border-slate-300 hover:bg-slate-100 transition-colors" onClick={() => setIsAddDialogOpen(true)}>
                        <UserCheck className="w-4 h-4 mr-2 text-indigo-600" />
                        Añadir Manualmente
                    </Button>
                )}
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="w-[300px] text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Persona</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Rol Asignado</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Membresía</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Asistencia</TableHead>
                            <TableHead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Fecha Ingreso</TableHead>
                            {isAdminOrAuditor && <TableHead className="text-right text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={isAdminOrAuditor ? 6 : 5} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${config.bgColor}`}>
                                            <UserCheck className={`w-8 h-8 ${config.color}`} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">No hay participantes aún</h3>
                                        <p className="text-slate-500 mt-1 max-w-xs mx-auto">Comienza agregando personas manualmente desde el botón superior.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            participants.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-slate-200">
                                            <AvatarImage src={p.churchPerson.person.profileImage} />
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                                                {p.churchPerson.person.firstName[0]}{p.churchPerson.person.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{p.churchPerson.person.fullName}</span>
                                            <span className="text-xs text-slate-500">{p.churchPerson.person.email || 'Sin correo'}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {editingPersonId === p.churchPerson.id ? (
                                        <Select value={editingRole} onValueChange={(val) => setEditingRole(val as GroupRole)}>
                                            <SelectTrigger className="h-8 w-32 border-slate-300">
                                                <SelectValue placeholder="Rol" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="COORDINATOR">Coordinador</SelectItem>
                                                <SelectItem value="TEACHER">Maestro</SelectItem>
                                                <SelectItem value="PARTICIPANT">Participante</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        getRoleBadge(p.role)
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-slate-600">
                                        {ROLE_UI_METADATA[p.churchPerson.membershipStatus as MembershipStatus]?.label || p.churchPerson.membershipStatus}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {p.attendance && p.attendance.totalMeetings > 0 ? (
                                        <div className="flex flex-col gap-1 w-24">
                                            <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                                                <span>{p.attendance.presentCount}/{p.attendance.totalMeetings}</span>
                                                <span>{Math.round((p.attendance.rate || 0) * 100)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        (p.attendance.rate || 0) >= 0.8 ? 'bg-emerald-500' : 
                                                        (p.attendance.rate || 0) >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: `${(p.attendance.rate || 0) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Sin registros</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                    {format(new Date(p.joinedAt), 'dd/MM/yyyy')}
                                </TableCell>
                                {isAdminOrAuditor && (
                                    <TableCell className="text-right">
                                        {editingPersonId === p.churchPerson.id ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8 p-0"
                                                    onClick={() => handleSaveRole(p.churchPerson.id)}
                                                >
                                                    <Save className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-8 w-8 p-0"
                                                    onClick={handleCancelEdit}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 h-8 w-8 p-0"
                                                    onClick={() => handleStartEdit(p.churchPerson.id, p.role)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                    onClick={() => handleRemove(p.churchPerson.id)}
                                                    disabled={removingId === p.churchPerson.id}
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </div>

            <AddParticipantDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                currentParticipants={participants}
                onAdd={handleBulkAdd}
            />
        </div>
    );
}
