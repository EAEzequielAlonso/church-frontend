import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface MinistryEventsListProps {
    ministryId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MinistryEventsList({ ministryId, open, onOpenChange }: MinistryEventsListProps) {
    const { token, churchId } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Event Form
    const [newEvent, setNewEvent] = useState({
        startDate: format(new Date(), "yyyy-MM-dd'T'10:00"),
        endDate: format(new Date(), "yyyy-MM-dd'T'11:00"),
        type: 'MINISTRY', // Instead of PREACHING
        title: '',
        description: ''
    });

    const fetchEvents = async () => {
        if (!ministryId || !churchId) return;
        setIsLoading(true);
        // Fetch current month + next 2 months for MVP context
        // Ideally should have date pickers, but let's fetch a wide range for now
        const start = new Date();
        start.setMonth(start.getMonth() - 1); // Last month
        const end = new Date();
        end.setMonth(end.getMonth() + 3); // Next 3 months

        try {
            const query = new URLSearchParams({
                startDate: start.toISOString(),
                endDate: end.toISOString()
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministryId}/events?${query}`, {
                headers: { Authorization: `Bearer ${token}`, 'x-church-id': churchId }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter client-side by ownerId since we removed explicit ministry relations
                const ministryEvents = data.filter((e: any) => e.ownerId === ministryId || e.ministry?.id === ministryId);
                // Sort ascending
                ministryEvents.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                setEvents(ministryEvents);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchEvents();
    }, [open, ministryId]);

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/${ministryId}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'x-church-id': churchId || ''
                },
                body: JSON.stringify(newEvent)
            });

            if (!res.ok) throw new Error('Error');
            toast.success('Evento creado');
            setIsCreateOpen(false);
            fetchEvents();
            setNewEvent({ startDate: format(new Date(), "yyyy-MM-dd'T'10:00"), endDate: format(new Date(), "yyyy-MM-dd'T'11:00"), type: 'MINISTRY', title: '', description: '' });
        } catch (err) {
            toast.error('Error al crear evento');
        }
    };

    // Grouping Logic
    const groupedEvents = events.reduce((acc: any, event: any) => {
        const eventDate = event.startDate || event.date; // fallback
        const monthKey = format(parseISO(eventDate), 'MMMM yyyy', { locale: es });
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(event);
        return acc;
    }, {});

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Cronograma de Actividades</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    <Button onClick={() => setIsCreateOpen(true)} className="w-full">
                        <Plus className="w-4 h-4 mr-2" /> Agendar Evento
                    </Button>

                    {isLoading ? (
                        <div className="text-center py-4">Cargando...</div>
                    ) : (
                        Object.entries(groupedEvents).map(([month, monthEvents]: [string, any]) => (
                            <div key={month} className="space-y-3">
                                <h3 className="font-semibold text-lg capitalize text-primary sticky top-0 bg-white py-2 z-10 border-b">
                                    {month}
                                </h3>
                                {monthEvents.map((event: any) => (
                                    <div key={event.id} className="flex gap-4 p-3 bg-slate-50 rounded-lg border">
                                        <div className="flex flex-col items-center justify-center bg-white border rounded p-2 min-w-[60px] h-[60px]">
                                            <span className="text-xs uppercase text-gray-500">
                                                {format(parseISO(event.startDate || event.date), 'EEE', { locale: es })}
                                            </span>
                                            <span className="text-xl font-bold">
                                                {format(parseISO(event.startDate || event.date), 'dd')}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">{event.title || 'Sin título'}</h4>
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">
                                                    {event.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {event.assignedMember ? `Asignado: ${event.assignedMember.person.fullName}` : 'Sin asignar'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                    {!isLoading && events.length === 0 && (
                        <p className="text-center text-gray-500">No hay eventos programados.</p>
                    )}
                </div>

                {/* Create Event Dialog Nested */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nuevo Evento</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha y Hora</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newEvent.startDate}
                                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Select
                                        value={newEvent.type}
                                        onValueChange={(val) => setNewEvent({ ...newEvent, type: val })}
                                        disabled
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MINISTRY">Ministerio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Ej: Mensaje Dominical"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción / Notas</Label>
                                <Input
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </SheetContent>
        </Sheet>
    );
}
