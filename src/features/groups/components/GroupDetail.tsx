import React from 'react';
import { GroupDto } from '../types/group.types';
import { getGroupTypeConfig } from '../config/group-type.config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CalendarDays, ClipboardCheck, Info } from 'lucide-react';

import { GroupParticipants } from './GroupParticipants';
import { GroupMeetings } from './GroupMeetings';

interface GroupDetailProps {
    group: GroupDto;
    isAdminOrAuditor: boolean;
    currentMemberId?: string;
    onEnroll: (memberId: string) => void;
    onDisenroll: (memberId: string) => void;
    refetch: () => void;
}

export function GroupDetail({
    group,
    isAdminOrAuditor,
    currentMemberId,
    onEnroll,
    onDisenroll,
    refetch
}: GroupDetailProps) {
    const config = getGroupTypeConfig(group.type);

    // A person is enrolled if they appear in participants array
    const isEnrolled = group.participants?.some(p => p.churchPerson.id === currentMemberId) ?? false;

    return (
        <div className="space-y-6">
            {/* Header / Hero */}
            <div className={`p-6 md:p-8 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-2 h-full ${config.bgColor}`} />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${config.bgColor} ${config.color} shadow-inner`}>
                            <config.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{group.name}</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                    {config.label}
                                </span>
                            </div>
                            <p className="text-slate-500 max-w-2xl text-lg">
                                {group.description || `No hay descripción provista.`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {!isEnrolled ? (
                            <button
                                onClick={() => currentMemberId && onEnroll(currentMemberId)}
                                className={`px-6 py-2.5 w-full md:w-auto rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${config.color.replace('text-', 'bg-')}`}
                            >
                                {config.joinButtonLabel}
                            </button>
                        ) : (
                            <button
                                onClick={() => currentMemberId && onDisenroll(currentMemberId)}
                                className={`px-6 py-2.5 w-full md:w-auto rounded-lg font-semibold bg-white border-2 text-slate-700 hover:bg-slate-50 transition-all ${config.borderColor}`}
                            >
                                {config.leaveButtonLabel}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Horario Regular</span>
                        <span className="text-slate-700 font-medium">{group.schedule || 'Sin especificar'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Ubicación</span>
                        <span className="text-slate-700 font-medium">{group.address || 'Sin especificar'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Visibilidad</span>
                        <span className="text-slate-700 font-medium">
                            {group.visibility === 'PUBLIC' ? 'Abierto a la Iglesia' : 'Privado'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Modular Tabs */}
            <Tabs defaultValue="participants" className="w-full">
                <TabsList className="mb-6 bg-white border border-slate-200 p-1 w-full flex overflow-x-auto justify-start h-12">
                    <TabsTrigger value="participants" className="gap-2 px-6">
                        <Users className="w-4 h-4" />
                        Participantes
                    </TabsTrigger>
                    <TabsTrigger value="meetings" className="gap-2 px-6">
                        <CalendarDays className="w-4 h-4" />
                        Encuentros & Asistencia
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="participants" className="mt-0 outline-none">
                    <GroupParticipants
                        participants={group.participants || []}
                        groupId={group.id}
                        isAdminOrAuditor={isAdminOrAuditor}
                        refetch={refetch}
                        groupType={group.type}
                    />
                </TabsContent>

                <TabsContent value="meetings" className="mt-0 outline-none">
                    <GroupMeetings
                        meetings={group.meetings || []}
                        groupId={group.id}
                        isAdminOrAuditor={isAdminOrAuditor}
                        isEnrolled={isEnrolled}
                        refetch={refetch}
                        groupType={group.type}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
