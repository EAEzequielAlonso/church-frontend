'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CreateMemberDialog } from './create-member-dialog';
import { MemberActionsMenu } from './member-actions-menu';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ROLE_UI_METADATA } from '@/constants/role-ui';
import { FunctionalRole, SystemRole } from '@/types/auth-types';
import api from '@/lib/api';

export default function MembersPage() {
    const { churchId, user } = useAuth();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const canManage = user?.systemRole === SystemRole.ADMIN_APP ||
        user?.roles?.includes(FunctionalRole.ADMIN_CHURCH) ||
        user?.roles?.includes(FunctionalRole.AUDITOR);
    const [showArchived, setShowArchived] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchMembers = async () => {
        if (!churchId) return;
        try {
            // Updated Logic:
            // If showArchived: fetch ?status=ARCHIVED
            // If !showArchived: fetch all and filter out ARCHIVED on client? Or ask backend for != ARCHIVED?
            // Backend `findAll` with `status` does exact match.
            // For now, let's fetch ALL and filter in client to avoid complex backend changes for "NOT equal".
            const res = await api.get('/members');
            setMembers(res.data);
        } catch (error) {
            console.error('Failed to fetch members', error);
            // Optionally toast.error("Error cargando miembros")
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [churchId]);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.person?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.person?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const isArchived = m.membershipStatus === 'ARCHIVED';
        const matchesStatus = showArchived ? isArchived : !isArchived;

        return matchesSearch && matchesStatus;
    });

    const paginatedMembers = filteredMembers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <ErrorBoundary sectionName="Miembros">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Miembros</h1>
                        <p className="text-gray-500 mt-1">Gestiona el directorio de tu iglesia</p>
                    </div>
                    {canManage && (
                        <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Miembro
                        </Button>
                    )}
                </div>

                <CreateMemberDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={fetchMembers} />

                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            className="pl-10"
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md px-3 py-2 bg-slate-50">
                        <Switch
                            id="archive-mode"
                            onCheckedChange={(checked) => {
                                setShowArchived(checked);
                                setCurrentPage(1);
                            }}
                        />
                        <Label htmlFor="archive-mode" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Ver Archivados
                        </Label>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Rol Eclesiástico</th>
                                    <th className="px-6 py-4">Funciones</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Fecha de Unión</th>
                                    {canManage && <th className="px-6 py-4 text-right">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedMembers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No se encontraron miembros.
                                        </td>
                                    </tr>
                                )}
                                {paginatedMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {member.person?.avatarUrl ? (
                                                    <img src={member.person.avatarUrl} alt={member.person.fullName} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                        {member.person?.fullName?.substring(0, 2) || 'NA'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{member.person?.fullName || 'Sin Nombre'}</p>
                                                    <p className="text-xs text-gray-500">{member.person?.email || 'Sin Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.ecclesiasticalRole && ROLE_UI_METADATA[member.ecclesiasticalRole as keyof typeof ROLE_UI_METADATA] ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_UI_METADATA[member.ecclesiasticalRole as keyof typeof ROLE_UI_METADATA].color}`}>
                                                    {ROLE_UI_METADATA[member.ecclesiasticalRole as keyof typeof ROLE_UI_METADATA].label}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(() => {
                                                    // Filter out MEMBER role for display
                                                    const displayRoles = (member.functionalRoles || []).filter((r: string) => r !== 'MEMBER');

                                                    if (displayRoles.length > 0) {
                                                        return displayRoles.map((role: string) => (
                                                            ROLE_UI_METADATA[role as keyof typeof ROLE_UI_METADATA] && (
                                                                <span key={role} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200`}>
                                                                    {ROLE_UI_METADATA[role as keyof typeof ROLE_UI_METADATA].label}
                                                                </span>
                                                            )
                                                        ));
                                                    }
                                                    return <span className="text-gray-400 text-xs">Sin Funciones</span>;
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.membershipStatus && ROLE_UI_METADATA[member.membershipStatus as keyof typeof ROLE_UI_METADATA] ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_UI_METADATA[member.membershipStatus as keyof typeof ROLE_UI_METADATA].color}`}>
                                                    {ROLE_UI_METADATA[member.membershipStatus as keyof typeof ROLE_UI_METADATA].label}
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                    {member.membershipStatus || '-'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
                                        </td>
                                        {canManage && (
                                            <td className="px-6 py-4 text-right">
                                                <MemberActionsMenu member={member} onRefresh={fetchMembers} />
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span>Filas por página:</span>
                            <select
                                className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="ml-2">
                                Mostrando {Math.min((currentPage - 1) * rowsPerPage + 1, filteredMembers.length)} - {Math.min(currentPage * rowsPerPage, filteredMembers.length)} de {filteredMembers.length}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredMembers.length / rowsPerPage), p + 1))}
                                disabled={currentPage >= Math.ceil(filteredMembers.length / rowsPerPage)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
