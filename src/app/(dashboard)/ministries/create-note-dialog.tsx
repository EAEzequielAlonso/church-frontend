'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateNoteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ministryId: string;
    eventId: string | null;
    onSuccess: () => void;
}

export function CreateNoteDialog({ open, onOpenChange, ministryId, eventId, onSuccess }: CreateNoteDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [noteId, setNoteId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("summary");
    const [formData, setFormData] = useState({
        summary: '',
        decisions: '',
        nextSteps: ''
    });

    useEffect(() => {
        if (open && eventId) {
            fetchEventNote();
        } else {
            resetForm();
        }
    }, [open, eventId]);

    const resetForm = () => {
        setNoteId(null);
        setFormData({
            summary: '',
            decisions: '',
            nextSteps: ''
        });
        setActiveTab("summary");
    }

    const fetchEventNote = async () => {
        if (!eventId) return;
        setIsFetching(true);
        try {
            const token = localStorage.getItem('accessToken');
            // Fixed URL to match controller: @Get('events/:eventId/notes')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries/events/${eventId}/notes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Check if response has content
                const text = await res.text();
                if (text) {
                    const note = JSON.parse(text);
                    setNoteId(note.id);
                    setFormData({
                        summary: note.summary || '',
                        decisions: note.decisions || '',
                        nextSteps: note.nextSteps || ''
                    });
                } else {
                    resetForm();
                }
            } else {
                resetForm();
            }
        } catch (error) {
            console.error('Error fetching note', error);
            resetForm();
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventId) return;

        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            // Fixed URL to match controller POST: @Post('events/:eventId/notes')
            // It updates if exists due to logic in service createOrUpdateNote
            const url = `${process.env.NEXT_PUBLIC_API_URL}/ministries/events/${eventId}/notes`;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    summary: formData.summary,
                    decisions: formData.decisions,
                    nextSteps: formData.nextSteps
                })
            });

            if (!res.ok) throw new Error('Error al guardar nota');

            toast.success('Bitácora guardada exitosamente');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar la nota');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col rounded-3xl p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            {noteId ? 'Editar Bitácora' : 'Nueva Bitácora'}
                        </DialogTitle>
                        <DialogDescription>
                            Registra los detalles importantes de esta reunión.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {isFetching ? (
                    <div className="flex-1 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col p-6 pt-2">
                            <TabsList className="grid w-full grid-cols-3 mb-4 h-12 rounded-xl bg-slate-100 p-1">
                                <TabsTrigger value="summary" className="gap-2 rounded-lg text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Resumen
                                </TabsTrigger>
                                <TabsTrigger value="decisions" className="gap-2 rounded-lg text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Acuerdos
                                </TabsTrigger>
                                <TabsTrigger value="nextSteps" className="gap-2 rounded-lg text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Siguientes Pasos
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex-1 relative">
                                <TabsContent value="summary" className="absolute inset-0 m-0 h-full">
                                    <div className="h-full flex flex-col space-y-2">
                                        <Label htmlFor="summary" className="sr-only">Resumen General</Label>
                                        <Textarea
                                            id="summary"
                                            placeholder="Escribe aquí el resumen de los temas discutidos en la reunión..."
                                            value={formData.summary}
                                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                            className="resize-none flex-1 border-slate-200 focus:ring-primary/20 text-base leading-relaxed p-4 rounded-xl"
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="decisions" className="absolute inset-0 m-0 h-full">
                                    <div className="h-full flex flex-col space-y-2">
                                        <Label htmlFor="decisions" className="sr-only">Acuerdos / Decisiones</Label>
                                        <Textarea
                                            id="decisions"
                                            placeholder="Lista las decisiones tomadas y acuerdos alcanzados..."
                                            value={formData.decisions}
                                            onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
                                            className="resize-none flex-1 border-slate-200 focus:ring-primary/20 text-base leading-relaxed p-4 rounded-xl bg-indigo-50/30"
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="nextSteps" className="absolute inset-0 m-0 h-full">
                                    <div className="h-full flex flex-col space-y-2">
                                        <Label htmlFor="nextSteps" className="sr-only">Siguientes Pasos</Label>
                                        <Textarea
                                            id="nextSteps"
                                            placeholder="Detalla las tareas pendientes y próximos pasos a seguir..."
                                            value={formData.nextSteps}
                                            onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                                            className="resize-none flex-1 border-slate-200 focus:ring-primary/20 text-base leading-relaxed p-4 rounded-xl"
                                        />
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>

                        <DialogFooter className="p-6 pt-0 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between mt-auto">
                            <div className="text-xs text-slate-400 font-medium">
                                {activeTab === 'summary' && 'Paso 1 de 3: Resume lo hablado'}
                                {activeTab === 'decisions' && 'Paso 2 de 3: Registra acuerdos'}
                                {activeTab === 'nextSteps' && 'Paso 3 de 3: Define acciones futuras'}
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="rounded-xl font-bold gap-2" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Guardar Todo
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
