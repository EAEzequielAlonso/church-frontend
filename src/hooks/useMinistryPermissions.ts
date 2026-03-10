import { useMemo } from 'react';
import { Ministry, MinistryTask } from '@/types/ministry';
import { MinistryRole, FunctionalRole, SystemRole } from '@/types/auth-types';

export function useMinistryPermissions(ministry: Ministry | null, user: any) {
    return useMemo(() => {
        const defaultPerms = {
            isLeader: false,
            isCoordinator: false,
            isLeaderOrCoordinator: false,
            isMember: false,
            canManageTask: (task: MinistryTask) => false,
        };

        if (!ministry || !user) return defaultPerms;

        // Admin override
        if (user.systemRole === SystemRole.ADMIN_APP || user.functionalRole === FunctionalRole.ADMIN_CHURCH) {
            return {
                isLeader: true,
                isCoordinator: false,
                isLeaderOrCoordinator: true,
                isMember: true,
                canManageTask: () => true, // Admins can manage any task
            };
        }

        const myMember = ministry.members?.find((m) => m.member.person.id === user.personId);

        const isLeader = myMember?.roleInMinistry === MinistryRole.LEADER;
        const isCoordinator = myMember?.roleInMinistry === MinistryRole.COORDINATOR;
        const isLeaderOrCoordinator = isLeader || isCoordinator;
        const isMember = !!myMember;

        const canManageTask = (task: MinistryTask) => {
            if (isLeaderOrCoordinator) return true;
            if (task.assignedTo?.person?.id === user.personId) return true;
            if (!task.assignedTo && isMember) return true;
            return false;
        };

        return {
            isLeader,
            isCoordinator,
            isLeaderOrCoordinator,
            isMember,
            canManageTask,
        };
    }, [ministry, user]);
}
