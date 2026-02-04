import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, LogOut } from 'lucide-react';
import { EditGroupDialog } from '../../edit-group-dialog';
import { SmallGroup } from '@/types/small-group';
import { useAuth } from '@/context/AuthContext';
import { isPast, isToday } from 'date-fns';

interface GroupDetailsHeaderProps {
    group: SmallGroup;
    canManage: boolean;
    isEncargado: boolean;
    isFinished: boolean;
    onAddMemberClick: () => void;
    onGroupUpdated: () => void;
    onLeave: () => void;
}

export function GroupDetailsHeader({ group, canManage, isEncargado, isFinished, onAddMemberClick, onGroupUpdated, onLeave }: GroupDetailsHeaderProps) {
    const router = useRouter();
    const { user } = useAuth();

    const totalParticipants = (group.members?.length || 0) + (group.guests?.length || 0);
    // Calculate past meetings
    const pastMeetingsCount = group.events?.filter(e => isPast(new Date(e.startDate)) && !isToday(new Date(e.startDate))).length || 0;

    const isUserMember = group.members?.some(m => m.member.id === user?.memberId);

    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full mt-1">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{group.name}</h1>
                        <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                                {totalParticipants} Participantes
                            </Badge>
                            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                {pastMeetingsCount} Reuniones
                            </Badge>
                            <Badge
                                className={`text-xs font-semibold px-2.5 py-0.5 ${group.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                    group.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                        'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {group.status === 'ACTIVE' ? 'ACTIVO' : group.status === 'SUSPENDED' ? 'SUSPENDIDO' : 'FINALIZADO'}
                            </Badge>
                        </div>
                    </div>
                    <p className="text-slate-500 mt-1 text-lg">{group.description}</p>
                </div>
            </div>
            <div className="flex gap-2 items-center">
                {canManage && (
                    <EditGroupDialog
                        group={group}
                        onGroupUpdated={onGroupUpdated}
                    />
                )}

                {(isEncargado || user?.roles?.includes('ADMIN_CHURCH')) && (
                    <Button onClick={onAddMemberClick} disabled={isFinished}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Participante
                    </Button>
                )}

                {isUserMember && (
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={onLeave}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Abandonar Grupo
                    </Button>
                )}
            </div>
        </div>
    );
}
