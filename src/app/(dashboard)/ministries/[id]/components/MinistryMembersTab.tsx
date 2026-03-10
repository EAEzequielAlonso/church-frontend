import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Pencil, Trash2 } from "lucide-react";
import { Ministry, MinistryMember } from '@/types/ministry';
import { MinistryRole } from '@/types/auth-types';
import { EditMemberRoleDialog } from "../../edit-member-role-dialog";
import { useState } from 'react';

interface MinistryMembersTabProps {
    ministry: Ministry;
    isLeader: boolean;
    onRemoveMember: (memberId: string) => void;
    onSuccess: () => void;
}

export function MinistryMembersTab({ ministry, isLeader, onRemoveMember, onSuccess }: MinistryMembersTabProps) {
    const [memberToEdit, setMemberToEdit] = useState<MinistryMember | null>(null);
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);

    return (
        <div className="space-y-4 outline-none">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-800">Lista de Equipo</h3>
                <Badge variant="secondary" className="font-bold text-[10px]">{ministry.members?.length || 0} PERSONAS</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {ministry.members?.map((member) => (
                    <Card key={member.id} className="group hover:ring-2 hover:ring-primary/20 transition-all border-none bg-white shadow-sm ring-1 ring-slate-200/50 rounded-2xl overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                                    {member.member.person.avatarUrl ? (
                                        <img src={member.member.person.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : <Users className="w-6 h-6 text-slate-300" />}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-black text-slate-900 leading-tight">
                                        {member.member.person.firstName} {member.member.person.lastName}
                                    </p>
                                    <Badge className="text-[9px] h-4 leading-none font-black bg-indigo-50 text-indigo-500 border-none capitalize">
                                        {
                                            {
                                                [MinistryRole.LEADER]: 'Líder',
                                                [MinistryRole.COORDINATOR]: 'Coordinador',
                                                [MinistryRole.TEAM_MEMBER]: 'Miembro del Equipo'
                                            }[member.roleInMinistry] || member.roleInMinistry
                                        }
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {isLeader && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 rounded-full hover:text-indigo-500 hover:bg-indigo-50"
                                            onClick={() => {
                                                setMemberToEdit(member);
                                                setIsEditRoleOpen(true);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 rounded-full hover:text-red-500 hover:bg-red-50"
                                            onClick={() => onRemoveMember(member.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <EditMemberRoleDialog
                open={isEditRoleOpen}
                onOpenChange={(open) => {
                    setIsEditRoleOpen(open);
                    if (!open) setMemberToEdit(null);
                }}
                ministryId={ministry.id}
                member={memberToEdit}
                onSuccess={onSuccess}
            />
        </div>
    );
}
