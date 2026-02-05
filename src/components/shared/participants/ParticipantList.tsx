'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Edit2, UserCheck, User, Users, Phone, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Generic Interfaces
interface Participant {
    id: string; // The ID of the generic record (program participant or group member)
    name: string;
    avatarUrl?: string;
    email?: string;
    phone?: string;
    role?: string; // 'LEADER', 'MEMBER', etc.
    type: 'MEMBER' | 'VISITOR' | 'GUEST';
    attendedCount?: number;
    totalEvents?: number;
}

interface ParticipantListProps {
    members: Participant[];
    visitors: Participant[];
    guests: Participant[];
    canManage: boolean;
    onRemove: (id: string, type: 'MEMBER' | 'VISITOR' | 'GUEST') => void;
    onEditGuest?: (guest: Participant) => void; // Only for visitors/guests usually
}

function ParticipantRow({ participant, canManage, onRemove, onEdit }: { participant: Participant, canManage: boolean, onRemove: () => void, onEdit?: () => void }) {
    return (
        <div className="flex items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm group hover:border-slate-200 transition-all">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm mr-3">
                <AvatarImage src={participant.avatarUrl} />
                <AvatarFallback className={`font-bold ${participant.type === 'MEMBER' ? 'bg-indigo-100 text-indigo-700' : (participant.type === 'VISITOR' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700')}`}>
                    {participant.name?.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm truncate">{participant.name}</p>
                    {participant.role === 'MODERATOR' && <Badge className="text-[10px] h-5 px-1 bg-indigo-600">LÍDER</Badge>}
                </div>
                {(participant.email || participant.phone) && (
                    <div className="flex gap-2 mt-0.5">
                        {participant.phone && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {participant.phone}</span>}
                        {participant.email && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {participant.email}</span>}
                    </div>
                )}
            </div>

            {/* Stats (Optional) */}
            {/* Stats (Optional) */}
            {typeof participant.attendedCount !== 'undefined' && participant.totalEvents && participant.totalEvents > 0 && (
                <div className="text-right mr-4 hidden sm:block">
                    {(() => {
                        const percentage = Math.round((participant.attendedCount || 0) / participant.totalEvents * 100);
                        let colorClass = 'text-red-600 bg-red-50 border-red-100';
                        if (percentage >= 80) colorClass = 'text-green-600 bg-green-50 border-green-100';
                        else if (percentage >= 50) colorClass = 'text-amber-600 bg-amber-50 border-amber-100';

                        return (
                            <Badge variant="outline" className={`${colorClass} font-bold text-xs`}>
                                {percentage}% ({participant.attendedCount}/{participant.totalEvents})
                            </Badge>
                        );
                    })()}
                    <p className="text-[10px] text-slate-400 mt-1">Asistencia</p>
                </div>
            )}

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canManage && onEdit && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50" onClick={onEdit}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                )}
                {canManage && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" onClick={onRemove}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function ParticipantList({ members, visitors, guests, canManage, onRemove, onEditGuest }: ParticipantListProps) {
    return (
        <Tabs defaultValue="members" className="w-full">
            <TabsList className="mb-6 grid grid-cols-3 h-12 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="members" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg py-2 transition-all">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Miembros <Badge variant="secondary" className="ml-2">{members.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="visitors" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg py-2 transition-all">
                    <User className="w-4 h-4 mr-2" />
                    Visitantes <Badge variant="secondary" className="ml-2">{visitors.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="guests" className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm rounded-lg py-2 transition-all">
                    <Users className="w-4 h-4 mr-2" />
                    Invitados <Badge variant="secondary" className="ml-2">{guests.length}</Badge>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-3">
                {members.length === 0 && <div className="text-center py-8 text-slate-400">No hay miembros inscritos.</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {members.map(p => (
                        <ParticipantRow key={p.id} participant={p} canManage={canManage} onRemove={() => onRemove(p.id, 'MEMBER')} />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="visitors" className="space-y-3">
                {visitors.length === 0 && <div className="text-center py-8 text-slate-400">No hay visitantes.</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visitors.map(p => (
                        <ParticipantRow key={p.id} participant={p} canManage={canManage} onRemove={() => onRemove(p.id, 'VISITOR')} onEdit={() => onEditGuest && onEditGuest(p)} />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="guests" className="space-y-3">
                {guests.length === 0 && <div className="text-center py-8 text-slate-400">No hay invitados.</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {guests.map(p => (
                        <ParticipantRow key={p.id} participant={p} canManage={canManage} onRemove={() => onRemove(p.id, 'GUEST')} onEdit={() => onEditGuest && onEditGuest(p)} />
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
}
