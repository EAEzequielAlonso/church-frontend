import { Button } from '@/components/ui/button';
import { CreateEventDialog } from '@/app/(dashboard)/agenda/create-event-dialog';
import { MeetingCard } from './MeetingCard';
import { Plus } from 'lucide-react';
import { SmallGroup } from '@/types/small-group';
import { isPast, isFuture, isToday } from 'date-fns';
import { CalendarEventType } from '@/types/agenda';

interface CalendarTabProps {
    group: SmallGroup;
    canManage: boolean;
    isFinished: boolean;
    onGroupUpdated: () => void;
    onRemoveEvent: (eventId: string) => void;
    isRemoving: boolean;
}

export function CalendarTab({ group, canManage, isFinished, onGroupUpdated, onRemoveEvent, isRemoving }: CalendarTabProps) {
    const today = new Date();
    const futureEvents = group.events?.filter(e => isFuture(new Date(e.startDate)) || isToday(new Date(e.startDate))) || [];
    const pastEvents = group.events?.filter(e => isPast(new Date(e.startDate)) && !isToday(new Date(e.startDate))) || [];

    // Sort: Future ASC, Past DESC
    futureEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    pastEvents.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Próximos Encuentros</h3>
                {canManage && (
                    <CreateEventDialog
                        onEventCreated={onGroupUpdated}
                        defaultType={CalendarEventType.SMALL_GROUP}
                        defaultEntityId={group.id}
                        trigger={
                            <Button disabled={isFinished}>
                                <Plus className="w-4 h-4 mr-2" />
                                Agendar Encuentro
                            </Button>
                        }
                    />
                )}
            </div>

            <div className="space-y-4">
                {futureEvents.length === 0 && <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">No hay encuentros programados.</div>}
                {futureEvents.map(event => (
                    <MeetingCard
                        key={event.id}
                        event={event}
                        members={group.members || []}
                        guests={group.guests || []}
                        isPast={false}
                        canManage={canManage}
                        onAttendanceUpdated={onGroupUpdated}
                        onRemoveEvent={onRemoveEvent}
                        isRemoving={isRemoving}
                    />
                ))}
            </div>

            {pastEvents.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Historial</h3>
                    <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                        {pastEvents.map(event => (
                            <MeetingCard
                                key={event.id}
                                event={event}
                                members={group.members || []}
                                guests={group.guests || []}
                                isPast={true}
                                canManage={canManage}
                                onAttendanceUpdated={onGroupUpdated}
                                onRemoveEvent={onRemoveEvent}
                                isRemoving={isRemoving}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
