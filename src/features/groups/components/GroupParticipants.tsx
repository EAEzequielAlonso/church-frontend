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
    const { disenroll, addParticipant, updateRole } = useGroupMutations();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
    const [editingRole, setEditingRole] = useState<GroupRole>('PARTICIPANT');

    const handleAdd = async (churchPersonId: string, role: GroupRole) => {
        await addParticipant(groupId, churchPersonId, role);
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

    if (participants.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${config.bgColor}`}>
                    <UserCheck className={`w-8 h-8 ${config.color}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No hay participantes aún</h3>
                <p className="text-slate-500 mt-1">Comparte o inscribe a alguien para comenzar.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">Directorio de Inscritos ({participants.length})</h3>
                {isAdminOrAuditor && (
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setIsAddDialogOpen(true)}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Añadir Manualmente
                    </Button>
                )}
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Persona</TableHead>
                            <TableHead>Rol Asignado</TableHead>
                            <TableHead>Membresía</TableHead>
                            <TableHead>Fecha Ingreso</TableHead>
                            {isAdminOrAuditor && <TableHead className="text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.map((p) => (
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
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AddParticipantDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                currentParticipants={participants}
                onAdd={handleAdd}
            />
        </div>
    );
}
