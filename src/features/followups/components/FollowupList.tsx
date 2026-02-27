'use client';
import { useState } from 'react';
import { useFollowups } from '../hooks/useFollowups';
import { FollowupStatus } from '../types/followup.types';
import { format } from 'date-fns';
import { Search, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const STATUS_CONFIG = {
    [FollowupStatus.VISITOR]: { label: 'Visitante', color: 'bg-blue-100 text-blue-800' },
    [FollowupStatus.PROSPECT]: { label: 'Candidato', color: 'bg-purple-100 text-purple-800' },
    [FollowupStatus.ARCHIVED]: { label: 'Archivado', color: 'bg-gray-100 text-gray-800' },
};

export function FollowupList() {
    const [status, setStatus] = useState<FollowupStatus | undefined>(undefined);
    const [search, setSearch] = useState('');
    const { followups, isLoading } = useFollowups({ status, search });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="pl-10 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[200px]"
                    value={status || ''}
                    onChange={(e) => setStatus(e.target.value ? e.target.value as FollowupStatus : undefined)}
                >
                    <option value="">Todos los Estados</option>
                    <option value={FollowupStatus.VISITOR}>Visitantes</option>
                    <option value={FollowupStatus.PROSPECT}>Candidatos</option>
                    <option value={FollowupStatus.ARCHIVED}>Archivados</option>
                </select>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : followups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No se encontraron seguimientos</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {followups.map((followup) => {
                        const statusMeta = STATUS_CONFIG[followup.status] || { label: followup.status, color: 'bg-gray-100' };

                        return (
                            <Card key={followup.id} className="hover:shadow-md transition-shadow duration-200 group">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {followup.followupPerson?.firstName?.[0]}
                                                {followup.followupPerson?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                {followup.followupPerson?.firstName} {followup.followupPerson?.lastName}
                                            </CardTitle>
                                            <p className="text-xs text-gray-500">Desde {format(new Date(followup.createdAt), 'dd MMM yyyy')}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className={`${statusMeta.color} border-0`}>
                                        {statusMeta.label}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-gray-400" />
                                            <span>Asignado a: <span className="font-medium text-gray-900">
                                                {followup.assignedToPerson?.firstName || 'Sin asignar'}
                                            </span></span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/followups/${followup.id}`} className="w-full">
                                        <div className="flex items-center justify-center w-full h-9 rounded-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors group-hover:bg-primary/5 group-hover:text-primary">
                                            Ver Detalles <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                        </div>
                                    </Link>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
