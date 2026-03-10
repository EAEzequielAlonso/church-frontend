import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, CalendarIcon, FileText, Pencil, Trash2, Clock, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CreateEventDialog } from '@/app/(dashboard)/agenda/create-event-dialog';
import { CalendarEvent, CalendarEventType } from '@/types/agenda';
import { Ministry } from '@/types/ministry';

interface MinistryAgendaTabProps {
    ministry: Ministry;
    isLeaderOrCoordinator: boolean;
    pastEventsLimit: number;
    setPastEventsLimit: React.Dispatch<React.SetStateAction<number>>;
    setNoteEventId: (id: string) => void;
    setIsNoteOpen: (open: boolean) => void;
    setEventToEdit: (event: CalendarEvent) => void;
    handleDeleteEvent: (eventId: string) => void;
    fetchMinistry: () => void;
}

export function MinistryAgendaTab({
    ministry,
    isLeaderOrCoordinator,
    pastEventsLimit,
    setPastEventsLimit,
    setNoteEventId,
    setIsNoteOpen,
    setEventToEdit,
    handleDeleteEvent,
    fetchMinistry,
}: MinistryAgendaTabProps) {
    const now = new Date();
    const sortedEvents = ministry.calendarEvents?.sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) || [];
    const upcomingEvents = sortedEvents.filter((e: CalendarEvent) => new Date(e.endDate) >= now);
    const pastEvents = sortedEvents.filter((e: CalendarEvent) => new Date(e.endDate) < now).reverse();

    const nextMeeting = upcomingEvents[0];
    const otherUpcoming = upcomingEvents.slice(1);

    return (
        <div className="space-y-8 outline-none">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Calendario de Reuniones</h3>
                    <p className="text-sm text-slate-500">Próximos eventos y registro histórico.</p>
                </div>
                {isLeaderOrCoordinator && (
                    <CreateEventDialog
                        onEventCreated={fetchMinistry}
                        defaultType={CalendarEventType.MINISTRY}
                        defaultEntityId={ministry.id}
                        trigger={
                            <Button size="sm" className="font-bold gap-2 rounded-xl h-10 px-4 shadow-lg shadow-indigo-500/20">
                                <Plus className="w-4 h-4" />
                                Agendar Reunión
                            </Button>
                        }
                    />
                )}
            </div>

            <div className="space-y-8">
                {/* Next Meeting Hero */}
                {nextMeeting && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-black text-[10px] uppercase tracking-wider">
                                Próxima Reunión
                            </Badge>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <Card className="border-none shadow-lg shadow-indigo-500/5 ring-1 ring-slate-200 overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center border border-indigo-100/50 shadow-inner">
                                            <span className="text-xs font-bold uppercase">{format(new Date(nextMeeting.startDate), 'MMM', { locale: es })}</span>
                                            <span className="text-2xl font-black leading-none">{format(new Date(nextMeeting.startDate), 'd')}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-black text-slate-900">{nextMeeting.title}</h4>
                                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                                    <Clock className="w-4 h-4 text-indigo-500" />
                                                    {format(new Date(nextMeeting.startDate), 'HH:mm')} - {format(new Date(nextMeeting.endDate), 'HH:mm')}
                                                </span>
                                                {nextMeeting.location && (
                                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                                        <MapPin className="w-4 h-4 text-indigo-500" />
                                                        {nextMeeting.location}
                                                    </span>
                                                )}
                                            </div>
                                            {nextMeeting.description && (
                                                <p className="text-slate-500 text-sm mt-2 max-w-2xl">{nextMeeting.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        {(nextMeeting.meetingNote || isLeaderOrCoordinator) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 font-bold border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white"
                                                onClick={() => {
                                                    setNoteEventId(nextMeeting.id);
                                                    setIsNoteOpen(true);
                                                }}
                                            >
                                                <FileText className="w-4 h-4" />
                                                {nextMeeting.meetingNote ? 'Ver Bitácora' : 'Crear Bitácora'}
                                            </Button>
                                        )}
                                        {isLeaderOrCoordinator && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                    onClick={() => setEventToEdit(nextMeeting)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDeleteEvent(nextMeeting.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Other Upcoming */}
                {otherUpcoming.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-xs uppercase text-slate-400 tracking-wider">Más Adelante</p>
                            <div className="h-px bg-slate-100 flex-1"></div>
                        </div>
                        <div className="grid gap-3">
                            {otherUpcoming.map((event: CalendarEvent) => (
                                <div key={event.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 transition-colors group">
                                    <div className="flex-shrink-0 w-12 text-center bg-slate-50 rounded-xl py-2 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <p className="text-[10px] font-bold uppercase">{format(new Date(event.startDate), 'MMM', { locale: es })}</p>
                                        <p className="text-lg font-black leading-none">{format(new Date(event.startDate), 'd')}</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 truncate">{event.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                            {format(new Date(event.startDate), 'HH:mm')}
                                            {event.location && <span>• {event.location}</span>}
                                        </p>
                                    </div>
                                    {isLeaderOrCoordinator && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => setEventToEdit(event)}>
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeleteEvent(event.id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* History */}
                <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-xs uppercase text-slate-400 tracking-wider">Historial de Reuniones</p>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>

                    {pastEvents.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs font-medium text-slate-400">No hay reuniones pasadas registradas.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-3">
                                {pastEvents.slice(0, pastEventsLimit).map((event: CalendarEvent) => (
                                    <div key={event.id} className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl opacity-80 hover:opacity-100 transition-opacity">
                                        <div className="flex-shrink-0 w-12 text-center bg-white rounded-xl py-2 text-slate-400 border border-slate-100">
                                            <p className="text-[10px] font-bold uppercase">{format(new Date(event.startDate), 'MMM', { locale: es })}</p>
                                            <p className="text-lg font-black leading-none">{format(new Date(event.startDate), 'd')}</p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-700 truncate">{event.title}</h4>
                                                {event.meetingNote && (
                                                    <Badge variant="secondary" className="bg-white border-slate-200 text-slate-500 text-[9px] gap-1 h-5">
                                                        <FileText className="w-3 h-3" />
                                                        Con Bitácora
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium">
                                                Finalizado • {format(new Date(event.startDate), 'HH:mm')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(event.meetingNote || isLeaderOrCoordinator) && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={`h-8 gap-2 text-xs font-bold ${event.meetingNote ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                                                    onClick={() => {
                                                        setNoteEventId(event.id);
                                                        setIsNoteOpen(true);
                                                    }}
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    {event.meetingNote ? 'Ver Bitácora' : 'Crear Bitácora'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {pastEvents.length > pastEventsLimit && (
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                    onClick={() => setPastEventsLimit(prev => prev + 5)}
                                >
                                    Ver anteriores...
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                    <div className="py-16 text-center bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-200/50">
                        <CalendarIcon className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                        <p className="text-sm font-bold text-slate-400">Sin eventos en el calendario</p>
                        <p className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Comienza agendando tu próxima reunión</p>
                    </div>
                )}
            </div>
        </div>
    );
}
