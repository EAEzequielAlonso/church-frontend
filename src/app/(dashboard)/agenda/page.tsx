'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    MapPin,
    ArrowRight,
    MessageSquare,
    ClipboardList,
    AlertCircle,
    Flag,
    Users
} from "lucide-react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO
} from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, List, LayoutGrid } from "lucide-react";
import { CreateEventDialog } from './create-event-dialog';
import { CalendarEventType } from '@/types/agenda';

export default function AgendaPage() {
    const router = useRouter();
    const [agenda, setAgenda] = useState<{ sessions: any[], tasks: any[], events: any[] }>({ sessions: [], tasks: [], events: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {
        fetchAgenda();
    }, []);

    const fetchAgenda = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agenda`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al cargar la agenda');
            const data = await res.json();
            // Ensure events array exists
            setAgenda({ ...data, events: data.events || [] });
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar la agenda');
        } finally {
            setIsLoading(false);
        }
    };

    // Unified List Logic
    const allActivities = [
        ...agenda.sessions.map(s => ({ ...s, derivedType: 'SESSION', sortDate: safeDate(s.date) })),
        ...agenda.tasks.map(t => ({ ...t, derivedType: 'TASK', sortDate: safeDate(t.date) })),
        ...agenda.events.map(e => ({ ...e, derivedType: 'EVENT', sortDate: safeDate(e.startDate) }))
    ]
        .filter(item => {
            if (!item.sortDate) return false;
            // Only show future or today's activities in the list
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return item.sortDate >= today;
        })
        .sort((a, b) => a.sortDate!.getTime() - b.sortDate!.getTime());

    const getEventLabel = (type: string) => {
        const labels: Record<string, string> = {
            'SMALL_GROUP': 'Grupo pequeño',
            'MINISTRY': 'Ministerio',
            'CHURCH': 'Iglesia',
            'PERSONAL': 'Personal',
            'OTHER': 'Otro',
            'COUNSELING': 'Acompañamiento',
            'DISCIPLESHIP': 'Discipulado'
        };
        return labels[type] || type;
    };

    const visibleActivities = allActivities.slice(0, visibleCount);
    const hasMore = visibleCount < allActivities.length;

    const loadMore = () => setVisibleCount(prev => prev + 5);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mi Agenda</h1>
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                            HOY
                        </span>
                        <span>{format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                    <CreateEventDialog
                        onEventCreated={fetchAgenda}
                        defaultType={CalendarEventType.PERSONAL}
                    />

                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
                        <Button
                            variant={viewMode === 'LIST' ? 'default' : 'ghost'}
                            size="sm"
                            className={`rounded-lg h-8 text-[11px] font-bold px-4 transition-all ${viewMode === 'LIST' ? 'shadow-md shadow-primary/20' : 'text-slate-500 hover:text-primary'}`}
                            onClick={() => setViewMode('LIST')}
                        >
                            <List className="w-3.5 h-3.5 mr-1.5" />
                            LISTA
                        </Button>
                        <Button
                            variant={viewMode === 'CALENDAR' ? 'default' : 'ghost'}
                            size="sm"
                            className={`rounded-lg h-8 text-[11px] font-bold px-4 transition-all ${viewMode === 'CALENDAR' ? 'shadow-md shadow-primary/20' : 'text-slate-500 hover:text-primary'}`}
                            onClick={() => setViewMode('CALENDAR')}
                        >
                            <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                            CALEND
                        </Button>
                    </div>
                </div>
            </div>

            {viewMode === 'LIST' ? (
                <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="md:col-span-2 space-y-6">

                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                                Próximas Actividades
                            </h2>
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px]">
                                {allActivities.length} PENDIENTES
                            </Badge>
                        </div>

                        {visibleActivities.length > 0 ? (
                            <div className="grid gap-4">
                                {visibleActivities.map((item: any, index: number) => {
                                    if (item.derivedType === 'EVENT') {
                                        const event = item;
                                        const startDate = event.sortDate;
                                        const endDate = safeDate(event.endDate);
                                        const timeDisplay = event.isAllDay
                                            ? 'Todo el día'
                                            : (endDate ? `${format(startDate!, "HH:mm")} - ${format(endDate, "HH:mm")}` : format(startDate!, "HH:mm"));

                                        return (
                                            <div key={`event-${event.id}`} className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                                <div className="flex flex-col items-center justify-center bg-slate-50 border rounded-lg p-2 min-w-[70px] h-[70px] self-start">
                                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                                        {format(startDate!, 'EEE', { locale: es })}
                                                    </span>
                                                    <span className="text-2xl font-black text-slate-800">
                                                        {format(startDate!, 'dd')}
                                                    </span>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors">
                                                            {event.title}
                                                        </h3>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${event.color ? 'text-white' : 'bg-slate-100 text-slate-600'}`} style={event.color ? { backgroundColor: event.color } : {}}>
                                                            {getEventLabel(event.type)}
                                                        </span>
                                                    </div>

                                                    {event.description && (
                                                        <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                                                            {event.description}
                                                        </p>
                                                    )}

                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {timeDisplay}
                                                        </div>
                                                        {event.location && (
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                                {event.location}
                                                            </div>
                                                        )}
                                                        {event.discipleship && (
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                                <Flag className="w-3.5 h-3.5 text-slate-400" />
                                                                {event.discipleship.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else if (item.derivedType === 'SESSION') {
                                        const session = item;
                                        const sessionDate = session.sortDate;
                                        return (
                                            <Card key={`session-${session.id}`} className="group hover:border-primary/40 transition-all shadow-sm border-slate-200/60 overflow-hidden">
                                                <CardContent className="p-0 flex">
                                                    <div className="w-2 bg-primary group-hover:w-3 transition-all"></div>
                                                    <div className="p-4 flex-grow flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-slate-900 uppercase">
                                                                    {format(sessionDate!, "EEEE d 'de' MMMM", { locale: es })}
                                                                </span>
                                                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-slate-200 text-slate-500 font-medium">ACOMPAÑAMIENTO</Badge>
                                                            </div>
                                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{session.motive}</h3>
                                                            <div className="flex flex-wrap gap-3 mt-1">
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                                    {format(sessionDate!, "HH:mm 'hs'")}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                                    {session.location || 'Por definir'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-10 px-4 font-bold text-primary hover:bg-primary/5 shrink-0"
                                                            onClick={() => router.push(`/counseling/${session.processId}`)}
                                                        >
                                                            Ver Detalles
                                                            <ArrowRight className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    } else if (item.derivedType === 'TASK') {
                                        const task = item;
                                        const taskDate = task.sortDate;
                                        return (
                                            <Card key={`task-${task.id}`} className="border-l-4 border-l-amber-400 shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                                                <CardContent className="p-3">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-sm text-slate-800">{task.title}</h4>
                                                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            DEL {taskDate ? format(taskDate, "dd/MM/yy") : 'PENDIENTE'}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-[10px] font-extrabold border-slate-200 hover:bg-slate-50"
                                                            onClick={() => router.push(`/counseling/${task.processId}?tab=TASKS`)}
                                                        >
                                                            Responder
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        ) : (
                            <Card className="border-dashed py-16 text-center bg-slate-50/30">
                                <CalendarIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-500">Agenda Libre</h3>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto">No tienes ninguna actividad programada próximamente.</p>
                            </Card>
                        )}

                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <Button variant="outline" onClick={loadMore} className="gap-2">
                                    Ver más actividades
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                    </div>

                    {/* SIDEBAR SUMMARY */}
                    <div className="space-y-4">
                        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-lg overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-1 opacity-10">
                                <MessageSquare className="w-20 h-20 -mr-6 -mt-6" />
                            </div>
                            <CardContent className="p-4 relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Resumen del Mes</p>
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-black">{agenda.sessions.length}</p>
                                        <p className="text-[9px] font-bold opacity-60 uppercase">Citas</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/20"></div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black">{agenda.tasks.length}</p>
                                        <p className="text-[9px] font-bold opacity-60 uppercase">Misiones</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/20"></div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black">{agenda.events.filter(e => e.type === 'SMALL_GROUP').length}</p>
                                        <p className="text-[9px] font-bold opacity-60 uppercase">G.P</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mini Calendar Hint */}
                        <Card className="bg-slate-50 border-slate-200">
                            <CardContent className="p-4 text-center">
                                <p className="text-xs text-slate-500 mb-2">Para una vista mensual detallada, cambia a la vista de calendario.</p>
                                <Button size="sm" variant="outline" onClick={() => setViewMode('CALENDAR')}>
                                    Ver Calendario Completo
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <CalendarView
                        agenda={agenda}
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                        router={router}
                    />
                </div>
            )}
        </div>
    );
}

// Helper to safely parse dates
function safeDate(dateStr: string | Date | undefined): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
}

function CalendarView({ agenda, currentMonth, setCurrentMonth, router }: any) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-200/50">
            <CardHeader className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-primary-foreground opacity-80" />
                        {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mt-1">
                        DISTRIBUCIÓN MENSUAL DE ACTIVIDADES
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-white hover:bg-white/10 rounded-full transition-all"
                        onClick={prevMonth}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 text-xs font-bold text-white hover:bg-white/10 rounded-lg border border-white/10"
                        onClick={() => setCurrentMonth(new Date())}
                    >
                        Hoy
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-white hover:bg-white/10 rounded-full transition-all"
                        onClick={nextMonth}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Weekdays Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                        <div key={day} className="py-3 text-center text-[9px] font-black text-slate-500 tracking-[0.1em] uppercase">
                            <span className="hidden md:inline">{day}</span>
                            <span className="md:hidden">{day.substring(0, 2)}</span>
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 h-[calc(100vh-320px)] min-h-[600px] border-l border-slate-100 bg-slate-50/20">
                    <style jsx global>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 3px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: rgba(0,0,0,0.1);
                            border-radius: 10px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: rgba(0,0,0,0.2);
                        }
                    `}</style>
                    {calendarDays.map((day, i) => {
                        const daySessions = agenda.sessions.filter((s: any) => {
                            const d = safeDate(s.date);
                            return d && isSameDay(d, day);
                        });
                        const dayTasks = agenda.tasks.filter((t: any) => {
                            const d = safeDate(t.date);
                            return d && isSameDay(d, day);
                        });
                        const dayEvents = agenda.events.filter((e: any) => {
                            const d = safeDate(e.startDate);
                            return d && isSameDay(d, day);
                        });

                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                        return (
                            <div
                                key={i}
                                className={`p-2 border-r border-b border-slate-100 flex flex-col gap-1 transition-all group hover:bg-white hover:shadow-inner relative min-h-[100px] ${!isSameMonth(day, monthStart)
                                    ? 'bg-slate-100/30'
                                    : isWeekend
                                        ? 'bg-slate-50/50'
                                        : 'bg-white/40'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isToday(day)
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                                        : isSameMonth(day, monthStart)
                                            ? 'text-slate-800'
                                            : 'text-slate-300'
                                        }`}>
                                        {format(day, 'd')}
                                    </span>
                                    {isToday(day) && (
                                        <Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary bg-primary/5 font-bold md:flex hidden">HOY</Badge>
                                    )}
                                </div>

                                <div className="space-y-1 overflow-y-auto mt-1 pr-1 custom-scrollbar flex-grow">
                                    {daySessions.map((s: any) => {
                                        const d = safeDate(s.date);
                                        if (!d) return null;
                                        return (
                                            <div
                                                key={s.id}
                                                className="p-1.5 px-2 rounded-lg bg-blue-600 text-white text-[9px] font-bold leading-tight cursor-pointer hover:bg-blue-700 transition-all shadow-sm hover:scale-[1.02] border border-blue-400/30 overflow-hidden"
                                                onClick={() => router.push(`/counseling/${s.processId}`)}
                                                title={s.motive}
                                            >
                                                <div className="flex items-center gap-1 mb-0.5 opacity-80">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span>{format(d, "HH:mm")}</span>
                                                </div>
                                                <div className="truncate">👁️ {s.motive}</div>
                                            </div>
                                        )
                                    })}
                                    {dayTasks.map((t: any) => {
                                        const d = safeDate(t.date);
                                        return (
                                            <div
                                                key={t.id}
                                                className="p-1.5 px-2 rounded-lg bg-amber-500 text-white text-[9px] font-bold leading-tight cursor-pointer hover:bg-amber-600 transition-all shadow-sm hover:scale-[1.02] border border-amber-400/30 overflow-hidden"
                                                onClick={() => router.push(`/counseling/${t.processId}?tab=TASKS`)}
                                                title={t.title}
                                            >
                                                <div className="flex items-center gap-1 mb-0.5 opacity-80">
                                                    <ClipboardList className="w-2.5 h-2.5" />
                                                    <span>{d ? format(d, "HH:mm") : '--:--'}</span>
                                                </div>
                                                <div className="truncate">📝 {t.title}</div>
                                            </div>
                                        )
                                    })}
                                    {dayEvents.map((e: any) => {
                                        const d = safeDate(e.startDate);
                                        if (!d) return null;
                                        return (
                                            <div
                                                key={e.id}
                                                className="p-1.5 px-2 rounded-lg text-white text-[9px] font-bold leading-tight cursor-pointer transition-all shadow-sm hover:scale-[1.02] border border-white/20 overflow-hidden"
                                                style={{ backgroundColor: e.color || '#6366f1' }}
                                                title={e.title}
                                            >
                                                <div className="flex items-center gap-1 mb-0.5 opacity-80">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span>{e.isAllDay ? 'Todo el día' : format(d, "HH:mm")}</span>
                                                </div>
                                                <div className="truncate">
                                                    {e.discipleship ? `🤝 ${e.title}` : e.title}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
