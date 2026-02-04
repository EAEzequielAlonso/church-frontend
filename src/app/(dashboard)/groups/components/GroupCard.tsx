import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Target, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';
import { SmallGroup } from '@/types/small-group';
import { toast } from 'sonner';

interface GroupCardProps {
    group: SmallGroup;
    currentMemberId?: string;
    onJoin: (groupId: string) => void;
    onLeave: (groupId: string) => void;
}

export function GroupCard({ group, currentMemberId, onJoin, onLeave }: GroupCardProps) {
    const router = useRouter();

    const isUserMember = group.members?.some(m => m.member.id === currentMemberId);
    const leader = group.members?.find(m => m.role === 'MODERATOR');

    return (
        <div className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {/* Decorative Header Gradient */}
            <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-primary to-indigo-500" />

            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {group.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{group.description || 'Sin descripción'}</p>
                    </div>
                    <span className="bg-primary/5 text-primary text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {group.members?.length || 0}
                    </span>
                </div>

                <div className="space-y-2.5">
                    {group.objective && (
                        <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-xs italic leading-relaxed">"{group.objective}"</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{group.meetingDay || 'A confirmar'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{group.meetingTime ? `${group.meetingTime} hs` : '--:--'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span className="truncate">{group.address || 'Ubicación rotativa'}</span>
                    </div>

                    {group.currentTopic && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="truncate font-medium">Tema: {group.currentTopic}</span>
                        </div>
                    )}

                    {leader && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                            <Target className="w-3.5 h-3.5 text-violet-500" />
                            <span className="truncate font-medium">Encargado: {leader.member.person?.firstName} {leader.member.person?.lastName}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                <Button
                    variant="default"
                    size="sm"
                    className="flex-1 font-semibold shadow-sm"
                    onClick={() => router.push(`/groups/${group.id}`)}
                >
                    Ver Grupo
                </Button>
                {isUserMember ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 font-semibold shadow-sm bg-white border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => onLeave(group.id)}
                    >
                        Salir del Grupo
                    </Button>
                ) : group.openEnrollment ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 font-semibold shadow-sm bg-white"
                        onClick={() => onJoin(group.id)}
                    >
                        Unirme
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
