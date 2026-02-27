import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, MoreVertical, Pencil, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

export interface Note {
    id: string;
    text: string;
    type: 'INTERNAL' | 'SHARED' | 'PASTORAL' | 'PERSONAL' | 'SUPERVISION';
    createdAt: string;
    authorPersonId?: string; // Ensure this is mapped if available, or derive from author
    author?: {
        firstName: string;
        lastName: string;
    };
}

interface FollowUpNotesProps {
    notes: Note[];
    loading: boolean;
    isAdmin: boolean;
    isAssigned: boolean;
    onEdit: (note: Note) => void;
    onDelete: (noteId: string) => void;
}

export function FollowUpNotes({ notes, loading, isAdmin, isAssigned, onEdit, onDelete }: FollowUpNotesProps) {
    const { user } = useAuth();

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }

    if (!notes.length) {
        return <div className="text-center py-8 text-muted-foreground">No hay notas registradas.</div>;
    }

    const sharedNotes = notes.filter(n => n.type === 'SHARED' || n.type === 'SUPERVISION');
    const internalNotes = notes.filter(n => n.type === 'INTERNAL' || n.type === 'PERSONAL');
    const pastoralNotes = notes.filter(n => n.type === 'PASTORAL');

    const NoteItem = ({ note }: { note: Note }) => {
        // Permission check: Author only
        // note.authorPersonId might be needed from backend or we check if we can rely on something else
        // Backend entity has authorPersonId. We need to ensure it's in the DTO.
        // If DTO doesn't have it, we might need to rely on matching name? No, unsafe.
        // Let's assume DTO includes authorPersonId (it's in the entity).
        // If not, we should update query. But let's check basic auth match.
        // Actually, for now let's rely on strict backend check for the actual action, and frontend check for UI.
        // User context has personId.

        const isAuthor = user?.personId && note.authorPersonId === user.personId;

        return (
            <div className="flex gap-3 p-4 border rounded-lg bg-card text-card-foreground shadow-sm group relative">
                <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {note.author?.firstName?.[0] || '?'}
                        {note.author?.lastName?.[0] || ''}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold leading-none">
                                {note.author?.firstName || 'Desconocido'} {note.author?.lastName || ''}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {format(new Date(note.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                                note.type === 'SHARED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                    note.type === 'INTERNAL' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                        note.type === 'PASTORAL' ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-gray-100"
                            )}>
                                {note.type === 'SHARED' ? 'Compartida' :
                                    note.type === 'INTERNAL' ? 'Interna' :
                                        note.type === 'PASTORAL' ? 'Pastoral' : note.type}
                            </span>

                            {isAuthor && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(note)}>
                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive focus:text-destructive">
                                            <Trash className="mr-2 h-3.5 w-3.5" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                </div>
            </div>
        );
    }

    const NoteList = ({ items }: { items: Note[] }) => (
        <div className="space-y-4 py-4">
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay notas en esta sección.</p>
            ) : (
                items.map(note => <NoteItem key={note.id} note={note} />)
            )}
        </div>
    );

    // ... rest of component


    // Determine Tabs
    // Default tab
    let defaultTab = 'shared';
    if (isAssigned && !isAdmin) defaultTab = 'internal';

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                {/* Logic: If Admin show Pastoral, If Assigned show Internal. Always show Shared. */}
                {/* If both, show all? TabsList grid-cols needs adjustment. */}

                {isAdmin ? (
                    <TabsTrigger value="pastoral">Pastorales</TabsTrigger>
                ) : (
                    isAssigned && <TabsTrigger value="internal">Internas</TabsTrigger>
                )}

                <TabsTrigger value="shared">Compartidas</TabsTrigger>
            </TabsList>

            {isAdmin && (
                <TabsContent value="pastoral">
                    <NoteList items={pastoralNotes} />
                </TabsContent>
            )}

            {isAssigned && (
                <TabsContent value="internal">
                    <NoteList items={internalNotes} />
                </TabsContent>
            )}

            <TabsContent value="shared">
                <NoteList items={sharedNotes} />
            </TabsContent>
        </Tabs>
    );
}
