'use client';

import { Loader2, Users } from 'lucide-react';
import { CreateGroupDialog } from './create-group-dialog';
import { useAuth } from '@/context/AuthContext';
import { useGroups } from './hooks/useGroups';
import { GroupCard } from './components/GroupCard';

export default function GroupsPage() {
    const { user } = useAuth();
    const { groups, isLoading, fetchGroups, handleJoin, handleLeave } = useGroups();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Grupos Pequeños</h1>
                    <p className="text-slate-500 mt-1 font-medium">Comunidad, crecimiento y vida compartida.</p>
                </div>
                <CreateGroupDialog onGroupCreated={fetchGroups} />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No hay grupos pequeños aún</h3>
                    <p className="text-slate-500">Comienza creando el primero.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            currentMemberId={user?.memberId}
                            onJoin={handleJoin}
                            onLeave={handleLeave}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
