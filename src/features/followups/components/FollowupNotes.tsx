'use client';
import { useState } from 'react';
import { useFollowupNotes } from '../hooks/useFollowups'; // Assuming exported from same file or useFollowupNotes.ts
import { FollowupNoteType } from '../types/followup.types';
import { format } from 'date-fns';
import { MessageSquare, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { followupApi } from '../api/followup.api';

export function FollowupNotes({ followupId }: { followupId: string }) {
    const { notes, isLoading, mutate } = useFollowupNotes(followupId);
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const [type, setType] = useState<FollowupNoteType>(FollowupNoteType.PERSONAL);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        try {
            await followupApi.createNote(followupId, { content, type });
            mutate();
            setOpen(false);
            setContent('');
            setType(FollowupNoteType.PERSONAL);
        } catch (error) {
            console.error('Failed to create note', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bitácora</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">Nueva Nota</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nota</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo</label>
                                <Select value={type} onValueChange={(v) => setType(v as FollowupNoteType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={FollowupNoteType.PERSONAL}>Personal</SelectItem>
                                        <SelectItem value={FollowupNoteType.SUPERVISION}>Supervisión</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contenido</label>
                                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribe tu nota aquí..." />
                            </div>
                            <Button onClick={handleSubmit} className="w-full">Guardar</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center text-muted-foreground">Cargando notas...</div>
                ) : notes.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4 border rounded-md border-dashed">No hay notas registradas.</div>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className={`p-4 rounded-lg border ${note.type === FollowupNoteType.SUPERVISION ? 'bg-amber-50 border-amber-200' : 'bg-card'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {note.type === FollowupNoteType.SUPERVISION ? (
                                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                                    ) : (
                                        <MessageSquare className="h-4 w-4 text-blue-500" />
                                    )}
                                    <span className="font-semibold text-sm">
                                        {note.authorPerson?.firstName} {note.authorPerson?.lastName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(note.createdAt), 'dd/MM/yyyy HH:mm')}
                                    </span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${note.type === FollowupNoteType.SUPERVISION ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {note.type === FollowupNoteType.SUPERVISION ? 'Supervisión' : 'Personal'}
                                </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
