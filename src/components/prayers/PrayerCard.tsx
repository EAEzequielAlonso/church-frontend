'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, MoreVertical, PenSquare, CheckCircle2, Trash2, ShieldAlert } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

interface PrayerCardProps {
    request: any;
    onEdit: (req: any) => void;
    onAnswer: (req: any) => void;
    onStatusChange: (id: string, status: string) => void;
    onToggleHidden: (id: string, isHidden: boolean) => void;
}

export default function PrayerCard({ request, onEdit, onAnswer, onStatusChange, onToggleHidden }: PrayerCardProps) {
    const { user } = useAuth();

    // Check if user is author
    // API returns member object. We need to check if user.memberId matches request.member.id
    const isAuthor = user?.memberId === request.member?.id;
    const canModerate = user?.roles?.includes('ADMIN_APP') || user?.roles?.includes('PASTOR');


    const getVisibilityBadge = () => {
        switch (request.visibility) {
            case 'PUBLIC': return null;
            case 'LEADERS_ONLY': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Solo Líderes</Badge>;
            case 'PRIVATE': return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200"><EyeOff className="w-3 h-3 mr-1" /> Privada</Badge>;
            default: return null;
        }
    };

    return (
        <Card className={`group relative transition-all duration-300 border-l-4 ${request.status === 'ANSWERED' ? 'border-l-emerald-500 bg-emerald-50/10' : 'border-l-indigo-500 hover:shadow-md'} ${request.isHidden ? 'opacity-75 bg-slate-50' : ''}`}>
            <CardHeader className="pb-3 pt-4 px-5 flex flex-row justify-between items-start space-y-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {request.isAnonymous && !isAuthor ? (
                            <span className="font-semibold text-slate-600">Anónimo</span>
                        ) : (
                            <span className="font-semibold text-slate-800">
                                {request.member?.person?.firstName} {request.member?.person?.lastName}
                                {request.isAnonymous && <span className="text-xs text-slate-400 font-normal ml-2">(Anónimo para otros)</span>}
                            </span>
                        )}
                        <span className="text-xs text-slate-400">• {format(new Date(request.createdAt), "d MMM", { locale: es })}</span>
                    </div>
                    <div className="flex gap-2">
                        {getVisibilityBadge()}
                        {request.isHidden && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 flex gap-1 items-center">
                                <ShieldAlert className="w-3 h-3" /> Oculta por Moderación
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex gap-1">
                    {(isAuthor || canModerate) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {(isAuthor || canModerate) && request.status !== 'ANSWERED' && (
                                    <>
                                        <DropdownMenuItem onClick={() => onEdit(request)}>
                                            <PenSquare className="w-4 h-4 mr-2" /> Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onAnswer(request)} className="text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50">
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar Respondida
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {canModerate && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">Moderación</div>
                                        {request.isHidden ? (
                                            <DropdownMenuItem onClick={() => onToggleHidden(request.id, false)}>
                                                <Eye className="w-4 h-4 mr-2" /> Restaurar (Visible)
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={() => onToggleHidden(request.id, true)} className="text-amber-600">
                                                <EyeOff className="w-4 h-4 mr-2" /> Ocultar
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => onStatusChange(request.id, 'DELETED')} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-5 pb-5">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {request.motive}
                </p>

                {request.status === 'ANSWERED' && request.testimony && (
                    <div className="mt-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Testimonio</h4>
                        </div>
                        <p className="text-sm text-emerald-900/80 italic">
                            "{request.testimony}"
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
