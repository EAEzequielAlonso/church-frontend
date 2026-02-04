import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Phone, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface ParticipantRowProps {
    name: string;
    photoUrl: string | null;
    phone?: string;
    email?: string;
    roleText: string;
    roleBadge?: ReactNode;
    attendanceProps: {
        attendedCount: number;
        totalEvents: number;
    };
    onRemove?: () => void;
    isRemoving?: boolean;
    canManage: boolean;
}

export function ParticipantRow({ name, photoUrl, phone, email, roleText, roleBadge, attendanceProps, onRemove, isRemoving, canManage }: ParticipantRowProps) {
    const attendancePercentage = attendanceProps.totalEvents > 0
        ? Math.round((attendanceProps.attendedCount / attendanceProps.totalEvents) * 100)
        : 0;

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 80) return 'text-emerald-600 bg-emerald-50';
        if (percentage >= 50) return 'text-amber-600 bg-amber-50';
        return 'text-rose-600 bg-rose-50';
    };

    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center space-x-4 min-w-0">
                <Avatar className="h-10 w-10 border border-slate-200">
                    <AvatarImage src={photoUrl || undefined} />
                    <AvatarFallback className="bg-slate-100 text-slate-500 font-medium">
                        {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                        {roleBadge}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                        <span>{roleText}</span>
                        {(email || phone) && <span className="text-slate-300">|</span>}
                        {phone && (
                            <div className="flex items-center gap-1" title={phone}>
                                <Phone className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">{phone}</span>
                            </div>
                        )}
                        {email && (
                            <div className="flex items-center gap-1" title={email}>
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${getAttendanceColor(attendancePercentage)}`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{attendancePercentage}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {attendanceProps.attendedCount}/{attendanceProps.totalEvents} asists.
                    </p>
                </div>

                {canManage && onRemove && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                                {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[400px]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar participante?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción eliminará a {name} del grupo.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={onRemove} className="bg-red-600 hover:bg-red-700 rounded-full">
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
}
