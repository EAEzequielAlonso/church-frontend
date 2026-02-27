import { Users, BookOpen, CalendarHeart, HandHeart, UsersRound, LucideIcon } from 'lucide-react';
import { GroupType } from '../types/group.types';

export interface GroupTypeConfig {
    id: GroupType;
    label: string;
    labelPlural: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    joinButtonLabel: string;
    leaveButtonLabel: string;
    emptyStateMessage: string;
    emptyStateDescription: string;
    createButtonLabel: string;
}

export const GROUP_TYPES_CONFIG: Record<GroupType, GroupTypeConfig> = {
    SMALL_GROUP: {
        id: 'SMALL_GROUP',
        label: 'Grupo Pequeño',
        labelPlural: 'Grupos Pequeños',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 hover:bg-blue-100',
        borderColor: 'border-blue-200',
        joinButtonLabel: 'Unirme al grupo',
        leaveButtonLabel: 'Salir del grupo',
        emptyStateMessage: 'No hay grupos pequeños aún',
        emptyStateDescription: 'Comienza creando el primer grupo para fomentar la comunidad.',
        createButtonLabel: 'Nuevo Grupo'
    },
    COURSE: {
        id: 'COURSE',
        label: 'Curso',
        labelPlural: 'Cursos y Talleres',
        icon: BookOpen,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 hover:bg-indigo-100',
        borderColor: 'border-indigo-200',
        joinButtonLabel: 'Inscribirme al curso',
        leaveButtonLabel: 'Anular inscripción',
        emptyStateMessage: 'No hay cursos activos',
        emptyStateDescription: 'Crea un programa de formación o escuela bíblica.',
        createButtonLabel: 'Nuevo Curso'
    },
    ACTIVITY: {
        id: 'ACTIVITY',
        label: 'Actividad',
        labelPlural: 'Actividades y Eventos',
        icon: CalendarHeart,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 hover:bg-emerald-100',
        borderColor: 'border-emerald-200',
        joinButtonLabel: 'Asistiré a la actividad',
        leaveButtonLabel: 'No podré asistir',
        emptyStateMessage: 'No hay eventos programados',
        emptyStateDescription: 'Crea un evento para la congregación.',
        createButtonLabel: 'Nueva Actividad'
    },
    DISCIPLESHIP: {
        id: 'DISCIPLESHIP',
        label: 'Discipulado',
        labelPlural: 'Mentoreo y Discipulados',
        icon: HandHeart,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 hover:bg-orange-100',
        borderColor: 'border-orange-200',
        joinButtonLabel: 'Unirme al discipulado',
        leaveButtonLabel: 'Salir del discipulado',
        emptyStateMessage: 'No hay asignaciones de discipulado',
        emptyStateDescription: 'Formaliza relaciones de discipulado 1 a 1 u organizadas.',
        createButtonLabel: 'Nuevo Discipulado'
    },
    MINISTRY_TEAM: {
        id: 'MINISTRY_TEAM',
        label: 'Equipo Ministerial',
        labelPlural: 'Equipos Ministeriales',
        icon: UsersRound,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 hover:bg-purple-100',
        borderColor: 'border-purple-200',
        joinButtonLabel: 'Solicitar unirme',
        leaveButtonLabel: 'Dejar el equipo',
        emptyStateMessage: 'No hay equipos configurados',
        emptyStateDescription: 'Crea equipos de servicio o ministerios.',
        createButtonLabel: 'Nuevo Equipo'
    }
};

export const getGroupTypeConfig = (type: GroupType): GroupTypeConfig => {
    return GROUP_TYPES_CONFIG[type] || GROUP_TYPES_CONFIG.SMALL_GROUP;
};
