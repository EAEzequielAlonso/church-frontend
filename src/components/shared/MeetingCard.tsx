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
import { Clock, MapPin, Users, Pencil, Trash2, CheckCircle, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { CalendarEvent } from '@/types/agenda';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MeetingCardProps {
    event: CalendarEvent;
    isPast: boolean;
    canManage: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onTakeAttendance?: () => void;

    // Config flags
    showAttendanceAction?: boolean;
    isDeleting?: boolean;

    // Slots for custom actions or dialog triggers if needed (alternative to handlers)
    editTrigger?: React.ReactNode;
}

export function MeetingCard({
    event,
    isPast,
    canManage,
    onEdit,
    onDelete,
    onTakeAttendance,
    showAttendanceAction = true,
    isDeleting = false,
    editTrigger
}: MeetingCardProps) {

    const startDate = new Date(event.startDate);
    const dayNumber = format(startDate, 'd');
    const month = format(startDate, 'MMM', { locale: es }).toUpperCase();
    const dayName = format(startDate, 'EEEE', { locale: es });
    const time = format(startDate, 'HH:mm');

    const attendeesCount = event.attendees?.length || 0;

    return (
        <div className={`
            group relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-all duration-200
            ${isPast ? 'bg-slate-50 border-slate-100 opacity-90 hover:opacity-100' : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'}
        `}>
            {/* Left Decorator Line */}
            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${event.color ? '' : 'bg-indigo-500'}`}
                style={{ backgroundColor: event.color }} />

            {/* Date Block (Logo-like) */}
            <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 shrink-0 pl-3">
                <div className={`
                    w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-sm border
                    ${isPast ? 'bg-white text-slate-400 border-slate-200' : 'bg-white text-indigo-600 border-indigo-100 ring-4 ring-indigo-50'}
                `}
                    style={!isPast && event.color ? { color: event.color, borderColor: `${event.color}30`, '--tw-ring-color': `${event.color}10` } as any : {}}
                >
                    <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                    <span className="text-2xl font-black leading-none">{dayNumber}</span>
                </div>
            </div>

            {/* Content Info */}
            <div className="flex-1 min-w-0 py-0.5">
                <h4 className={`text-lg font-bold truncate pr-2 ${isPast ? 'text-slate-600' : 'text-slate-900'}`}>
                    {event.title}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1.5">
                    <div className="flex items-center text-sm text-slate-500 font-medium">
                        <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                        <span className="capitalize">{dayName}, {time} hs</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center text-sm text-slate-500">
                            <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                            <span className="truncate max-w-[200px]">{event.location}</span>
                        </div>
                    )}
                </div>

                {attendeesCount > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Users className="w-3.5 h-3.5" />
                        {attendeesCount} Asistentes
                    </div>
                )}
            </div>

            {/* Actions Toolbar */}
            {canManage && (
                <div className="flex items-center justify-end sm:flex-col sm:justify-center gap-2 pt-2 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 mt-2 sm:mt-0">

                    {/* Attendance Action */}
                    {showAttendanceAction && onTakeAttendance && (
                        <Button
                            variant={isPast ? "secondary" : "default"}
                            size="sm"
                            className={`w-full sm:w-auto justify-start sm:justify-center ${isPast ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'}`}
                            onClick={onTakeAttendance}
                        >
                            <CheckCircle className="w-4 h-4 sm:mr-2" />
                            <span className="sm:inline">{isPast || attendeesCount > 0 ? 'Asistencia' : 'Tomar Asistencia'}</span>
                        </Button>
                    )}

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Edit Action */}
                        {editTrigger ? editTrigger : (
                            onEdit && (
                                <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            )
                        )}

                        {/* Delete Action */}
                        {onDelete && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar encuentro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Se perderán los registros de asistencia.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
