import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { GroupDto } from '../types/group.types';
import { getGroupTypeConfig } from '../config/group-type.config';

interface GroupCardProps {
    group: GroupDto;
    isAdminOrAuditor: boolean;
    currentMemberId?: string;
    onViewStart?: (id: string) => void;
    onJoin?: (id: string) => void;
    onLeave?: (id: string) => void;
    onEdit?: (group: GroupDto) => void;
    onDelete?: (id: string) => void;
}

export function GroupCard({
    group,
    isAdminOrAuditor,
    currentMemberId,
    onViewStart,
    onJoin,
    onLeave,
    onEdit,
    onDelete
}: GroupCardProps) {
    const config = getGroupTypeConfig(group.type);
    const Icon = config.icon;

    // A person is enrolled if they appear in participants array
    const isEnrolled = group.participants?.some(p => p.churchPerson.id === currentMemberId);
    const participantsCount = group.participants?.length || 0;

    return (
        <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 ${config.borderColor} group bg-white`}>
            {/* Header / Config Bar */}
            <div className={`h-2 ${config.bgColor}`} />

            <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex p-1.5 rounded-lg ${config.bgColor} ${config.color}`}>
                                <Icon className="w-5 h-5" />
                            </span>
                            <Badge variant={group.visibility === 'PUBLIC' ? 'default' : 'secondary'} className="text-xs font-semibold">
                                {group.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
                            </Badge>
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 line-clamp-1">{group.name}</h3>
                    </div>

                    {/* Admin Actions */}
                    {isAdminOrAuditor && (
                        <div className="flex gap-1 bg-slate-50 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEdit && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); onEdit(group); }}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm text-slate-500 line-clamp-2 h-10">
                    {group.description || `No hay descripción para este ${config.label.toLowerCase()}.`}
                </p>

                <div className="space-y-2">
                    {group.schedule && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">{group.schedule}</span>
                        </div>
                    )}
                    {group.address && (
                        <div className="flex items-center text-sm text-slate-600">
                            <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">{group.address}</span>
                        </div>
                    )}
                    <div className="flex items-center text-sm text-slate-600">
                        <Users className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                        <span>{participantsCount} inscritos</span>
                    </div>
                </div>

                <div className="pt-2 text-xs text-slate-400">
                    Creado el {format(new Date(group.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                </div>
            </CardContent>

            <CardFooter className="pt-2 gap-2 flex flex-col sm:flex-row">
                {onViewStart && (
                    <Button
                        variant="outline"
                        className="w-full sm:w-1/2"
                        onClick={() => onViewStart(group.id)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                    </Button>
                )}

                {isEnrolled ? (
                    onLeave && (
                        <Button
                            variant="secondary"
                            className="w-full sm:w-1/2 text-orange-600 bg-orange-50 hover:bg-orange-100 border-none"
                            onClick={() => onLeave(group.id)}
                        >
                            {config.leaveButtonLabel}
                        </Button>
                    )
                ) : (
                    onJoin && (
                        <Button
                            className={`w-full sm:w-1/2 ${config.color.replace('text-', 'bg-')} text-white hover:opacity-90`}
                            onClick={() => onJoin(group.id)}
                        >
                            {config.joinButtonLabel}
                        </Button>
                    )
                )}
            </CardFooter>
        </Card>
    );
}
