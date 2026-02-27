'use client';
import { useFollowupDetail } from '../hooks/useFollowups';
import { FollowupNotes } from './FollowupNotes';
import { FollowupAssignDialog } from './FollowupAssignDialog';
import { FollowupStatus } from '../types/followup.types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { followupApi } from '../api/followup.api';
import { useRouter } from 'next/navigation';

export function FollowupDetail({ id }: { id: string }) {
    const { followup, isLoading, mutate } = useFollowupDetail(id);
    const router = useRouter();

    if (isLoading) return <div>Cargando...</div>;
    if (!followup) return <div>No encontrado</div>;

    const handleStatusChange = async (newStatus: FollowupStatus) => {
        try {
            await followupApi.changeStatus(followup.id, newStatus);
            mutate();
        } catch (error) {
            console.error('Failed to change status', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/followups">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {followup.followupPerson?.firstName} {followup.followupPerson?.lastName}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span>Asignado a: <span className="font-medium text-foreground">{followup.assignedToPerson?.firstName} {followup.assignedToPerson?.lastName}</span></span>
                        <FollowupAssignDialog followupId={followup.id} currentAssigneeId={followup.assignedToPersonId} />
                        <span>•</span>
                        <span>Creado: {format(new Date(followup.createdAt), 'dd/MM/yyyy')}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={followup.status}
                        onChange={(e) => handleStatusChange(e.target.value as FollowupStatus)}
                    >
                        {Object.values(FollowupStatus).map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold mb-4">Información</h3>
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-muted-foreground">Estado:</span>
                                <span className="col-span-2 font-medium">{followup.status}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-muted-foreground">Teléfono:</span>
                                <span className="col-span-2">No disponible</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="col-span-2">No disponible</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <FollowupNotes followupId={followup.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
