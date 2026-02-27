import { FamilyRole } from '../types/family.types';

export const FAMILY_ROLE_LABELS: Record<FamilyRole, string> = {
    'FATHER': 'Padre',
    'MOTHER': 'Madre',
    'SPOUSE': 'Esposo/a',
    'CHILD': 'Hijo/a',
    'MEMBER': 'Miembro'
};

export const getFamilyRoleLabel = (role: string): string => {
    return FAMILY_ROLE_LABELS[role as FamilyRole] || role;
};
