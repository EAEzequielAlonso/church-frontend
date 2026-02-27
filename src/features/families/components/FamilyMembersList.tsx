import { FamilyMemberDto } from '../types/family.types';
import { Users } from 'lucide-react';
import { getFamilyRoleLabel } from '../utils/role.utils';

interface FamilyMembersListProps {
    members: FamilyMemberDto[];
    limit?: number;
}

export function FamilyMembersList({ members, limit }: FamilyMembersListProps) {
    const displayMembers = limit ? members.slice(0, limit) : members;
    const remaining = limit ? Math.max(0, members.length - limit) : 0;

    if (!members || members.length === 0) {
        return <span className="text-gray-400 text-xs italic">Sin miembros registrados</span>;
    }

    return (
        <div className="flex flex-col text-xs text-gray-600 space-y-1">
            {displayMembers.map((fm) => (
                <div key={fm.id || fm.member?.id} className="flex items-center gap-2">
                    <span className={`font-semibold ${fm.role === 'FATHER' ? 'text-blue-600' : fm.role === 'MOTHER' ? 'text-pink-600' : 'text-gray-600'}`}>
                        {getFamilyRoleLabel(fm.role)}:
                    </span>
                    <span>{fm.member?.person?.fullName}</span>
                </div>
            ))}
            {remaining > 0 && (
                <span className="text-gray-400 italic pl-1">+ {remaining} más</span>
            )}
        </div>
    );
}
