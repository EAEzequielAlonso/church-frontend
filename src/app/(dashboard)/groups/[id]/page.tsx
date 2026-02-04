'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddPeopleDialog from '@/components/courses/AddPeopleDialog';

import { useGroupDetails } from '../hooks/useGroupDetails';
import { GroupDetailsHeader } from './components/GroupDetailsHeader';
import { OverviewTab } from './components/OverviewTab';
import { ParticipantsTab } from './components/ParticipantsTab';
import { CalendarTab } from './components/CalendarTab';

export default function GroupDetailsPage() {
    const params = useParams();
    const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);

    const {
        group,
        isLoading,
        isRemoving,
        fetchGroup,
        handleRemoveMember,
        handleRemoveGuest,
        handleRemoveEvent,
        handleLeave,
        isEncargado,
        canManage,
        isFinished
    } = useGroupDetails(params.id as string);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!group) return null; // Hook handles error toast

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            <GroupDetailsHeader
                group={group}
                canManage={canManage || false} // Handle undefined safety
                isEncargado={isEncargado || false}
                isFinished={isFinished || false}
                onAddMemberClick={() => setIsAddPeopleOpen(true)}
                onGroupUpdated={fetchGroup}
                onLeave={handleLeave}
            />

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-slate-100/80 p-1 rounded-lg">
                    <TabsTrigger value="overview" className="px-6">Vision General</TabsTrigger>
                    <TabsTrigger value="members" className="px-6">Participantes</TabsTrigger>
                    <TabsTrigger value="calendar" className="px-6">Calendario y Asistencia</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6 animate-in fade-in-50 duration-500">
                    <OverviewTab group={group} />
                </TabsContent>

                <TabsContent value="members" className="mt-6 animate-in fade-in-50 duration-500">
                    <ParticipantsTab
                        group={group}
                        canManage={canManage || false}
                        isFinished={isFinished || false}
                        onRemoveMember={handleRemoveMember}
                        onRemoveGuest={handleRemoveGuest}
                        onAddGuestClick={() => setIsAddPeopleOpen(true)}
                        isRemoving={isRemoving}
                    />
                </TabsContent>

                <TabsContent value="calendar" className="mt-6 animate-in fade-in-50 duration-500 space-y-8">
                    <CalendarTab
                        group={group}
                        canManage={canManage || false}
                        isFinished={isFinished || false}
                        onGroupUpdated={fetchGroup}
                        onRemoveEvent={handleRemoveEvent}
                        isRemoving={isRemoving}
                    />
                </TabsContent>
            </Tabs>

            <AddPeopleDialog
                open={isAddPeopleOpen}
                onOpenChange={setIsAddPeopleOpen}
                type="small-group"
                entityId={group.id}
                existingMemberIds={group.members?.map(m => m.member.id) || []}
                existingVisitorIds={group.guests?.filter(g => g.followUpPerson).map(g => g.followUpPerson!.id) || []}
                existingGuestIds={group.guests?.filter(g => g.personInvited).map(g => g.personInvited!.id) || []}
                onSuccess={fetchGroup}
            />
        </div>
    );
}
