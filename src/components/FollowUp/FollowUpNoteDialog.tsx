import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export type FollowUpNoteType = 'INTERNAL' | 'SHARED' | 'PASTORAL';

interface FollowUpNoteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { text: string; type: FollowUpNoteType }) => Promise<void>;
    isAdmin: boolean;
    isAssigned: boolean;
    initialData?: {
        text: string;
        type: FollowUpNoteType;
    };
    mode: 'create' | 'edit';
}

export function FollowUpNoteDialog({
    open,
    onOpenChange,
    onSubmit,
    isAdmin,
    isAssigned,
    initialData,
    mode
}: FollowUpNoteDialogProps) {
    const [text, setText] = useState('');
    const [type, setType] = useState<FollowUpNoteType>('INTERNAL');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (initialData && mode === 'edit') {
                setText(initialData.text);
                setType(initialData.type);
            } else {
                setText('');
                setType('INTERNAL');
            }
        }
    }, [open, initialData, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        try {
            await onSubmit({ text, type });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Agregar Nota' : 'Editar Nota'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="note-type">Privacidad de la Nota</Label>
                        <Select
                            value={type}
                            onValueChange={(val) => setType(val as FollowUpNoteType)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SHARED">Compartida (Todos)</SelectItem>
                                {isAssigned && (
                                    <SelectItem value="INTERNAL">Interna (Solo Responsables)</SelectItem>
                                )}
                                {isAdmin && (
                                    <SelectItem value="PASTORAL">Pastoral (Solo Admins)</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="note-text">Nota</Label>
                        <Textarea
                            id="note-text"
                            placeholder="Escriba su nota aquí..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting || !text.trim()}>
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
