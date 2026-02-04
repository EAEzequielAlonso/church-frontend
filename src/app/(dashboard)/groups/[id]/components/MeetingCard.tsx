import { MeetingCard as SharedMeetingCard } from '@/components/shared/MeetingCard';
import { CreateEventDialog } from '@/app/(dashboard)/agenda/create-event-dialog';
import { TakeAttendanceDialog } from '../../take-attendance-dialog';
import { CalendarEvent } from '@/types/agenda';
import { SmallGroupMember, SmallGroupGuest } from '@/types/small-group';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface MeetingCardProps {
    event: CalendarEvent;
    members: SmallGroupMember[];
    guests: SmallGroupGuest[];
    isPast: boolean;
    canManage: boolean;
    onAttendanceUpdated: () => void;
    onRemoveEvent: (eventId: string) => void;
    isRemoving: boolean;
}

export function MeetingCard({ event, members, guests, isPast, canManage, onAttendanceUpdated, onRemoveEvent, isRemoving }: MeetingCardProps) {
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

    return (
        <>
            <SharedMeetingCard
                event={event}
                isPast={isPast}
                canManage={canManage}
                onTakeAttendance={() => setIsAttendanceOpen(true)}
                onDelete={() => onRemoveEvent(event.id)}
                isDeleting={isRemoving}
                showAttendanceAction={true}
                editTrigger={
                    <CreateEventDialog
                        onEventCreated={onAttendanceUpdated}
                        eventToEdit={event}
                        trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                <Pencil className="w-4 h-4" />
                            </Button>
                        }
                    />
                }
            />

            {/* Dialogs controlled by local state but rendered outside the card visual structure */}
            <TakeAttendanceDialog
                open={isAttendanceOpen}
                onOpenChange={setIsAttendanceOpen}
                event={event}
                members={members}
                guests={guests}
                onSuccess={onAttendanceUpdated}
            />
        </>
    );
}
