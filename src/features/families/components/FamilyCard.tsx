'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MoreVertical, Trash2, Pencil, Calendar } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FamilyDto } from '../types/family.types';
import { FamilyMembersList } from './FamilyMembersList';

interface FamilyCardProps {
    family: FamilyDto;
    canManage: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onViewMembers?: (id: string) => void; // For future expansion or dialog
}

export default function FamilyCard({
    family,
    canManage,
    onEdit,
    onDelete
}: FamilyCardProps) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-t-4 border-t-indigo-500 overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {family.name}
                            </CardTitle>
                            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {family.createdAt ? format(new Date(family.createdAt), "d MMM yyyy", { locale: es }) : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {canManage && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(family.id)} className="text-slate-700">
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(family.id)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="bg-slate-50 rounded-lg p-3 min-h-[80px]">
                    <FamilyMembersList members={family.members} limit={4} />
                </div>

                <div className="mt-4 flex gap-2">
                    <Button
                        onClick={() => onEdit(family.id)}
                        variant="outline"
                        className="w-full text-xs h-8 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
                        disabled={!canManage}
                    >
                        <Pencil className="w-3 h-3 mr-2" />
                        Gestionar Familia
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
