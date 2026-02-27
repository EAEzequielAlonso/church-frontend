'use client';

import { use, useState } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Clock, Users, ArrowUp, ArrowDown } from 'lucide-react';
import useSWR from 'swr';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react'; // Import Pencil icon

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Modal & Form State
    const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

    // Form Field States (Controlled)
    const [title, setTitle] = useState('');
    const [sectionType, setSectionType] = useState('GENERAL');
    const [duration, setDuration] = useState(15);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedMinistry, setSelectedMinistry] = useState<string>('ALL');

    // Delete Alert State
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

    // Fetch Template
    const { data: template, isLoading, mutate } = useSWR(`/worship-services/templates/${id}`, async (url) => (await api.get(url)).data);

    // Fetch All Possible Duties (Roles) across ministries
    const { data: allDuties } = useSWR('/ministries/duties/all', async (url) => (await api.get(url)).data);

    const resetForm = () => {
        setTitle('');
        setSectionType('GENERAL');
        setDuration(15);
        setSelectedRoles([]);
        setSelectedMinistry('ALL');
        setIsEditMode(false);
        setEditingSectionId(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsAddSectionOpen(true);
    };

    const openEditModal = (section: any) => {
        setTitle(section.title);
        setSectionType(section.type);
        setDuration(section.defaultDuration);
        setSelectedRoles(section.requiredRoles?.map((r: any) => r.id) || []);
        setSelectedMinistry(section.ministryId || 'ALL'); // Assuming ministryId is available or inferred
        setIsEditMode(true);
        setEditingSectionId(section.id);
        setIsAddSectionOpen(true);
    };

    const handleSaveSection = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = {
            title,
            defaultDuration: sectionType === 'GLOBAL' ? 0 : duration,
            type: sectionType,
            order: isEditMode ? undefined : (template.sections?.length || 0) + 1, // Order is handled separately usually, but for new items append.
            ministryId: selectedMinistry === 'ALL' ? null : selectedMinistry,
            requiredRoleIds: selectedRoles
        };

        try {
            if (isEditMode && editingSectionId) {
                await api.patch(`/worship-services/templates/${id}/sections/${editingSectionId}`, payload);
                toast.success('Sección actualizada');
            } else {
                await api.post(`/worship-services/templates/${id}/sections`, payload);
                toast.success('Sección agregada');
            }
            mutate();
            setIsAddSectionOpen(false);
            resetForm();
        } catch (error) {
            toast.error(isEditMode ? 'Error al actualizar sección' : 'Error al agregar sección');
        }
    };

    const handleDeleteClick = (sectionId: string) => {
        setSectionToDelete(sectionId);
        setIsDeleteAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!sectionToDelete) return;
        try {
            await api.delete(`/worship-services/templates/${id}/sections/${sectionToDelete}`);
            toast.success('Sección eliminada');
            mutate();
        } catch (error) {
            toast.error('Error al eliminar');
        } finally {
            setIsDeleteAlertOpen(false);
            setSectionToDelete(null);
        }
    };

    const toggleRoleSelection = (roleId: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    if (isLoading) return <PageContainer title="Cargando..." description=""><Skeleton className="w-full h-96" /></PageContainer>;
    if (!template) return <p>Plantilla no encontrada</p>;

    return (
        <PageContainer
            title={`Editor: ${template.name}`}
            description="Diseña la estructura base del culto."
            backButton={true}
        >
            <div className="flex justify-end mb-6">
                <Button onClick={openAddModal} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4" />
                    Agregar Sección
                </Button>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
                {template.sections?.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                        <p className="text-slate-500 font-medium">Esta plantilla está vacía.</p>
                        <p className="text-sm text-slate-400">Agrega secciones como "Alabanza", "Predicación", etc.</p>
                    </div>
                )}

                {/* Global Sections (Non-Timeline) */}
                {(() => {
                    const globalSections = template.sections?.filter((s: any) => s.type === 'GLOBAL') || [];
                    if (globalSections.length === 0) return null;
                    return (
                        <div className="space-y-2 mb-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Configuración Global</h3>
                            {globalSections.map((section: any) => (
                                <Card key={section.id} className="group border-l-4 border-l-indigo-500 bg-slate-50/50 hover:ring-1 hover:ring-indigo-100 transition-all">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-800 text-lg">{section.title}</h4>
                                                    <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700">TODO EL CULTO</Badge>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600" onClick={() => openEditModal(section)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={() => handleDeleteClick(section.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex gap-1 flex-wrap">
                                                    {section.requiredRoles?.map((role: any) => (
                                                        <Badge key={role.id} variant="outline" className="text-[10px] bg-white text-slate-700 border-slate-200">
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                    {(!section.requiredRoles || section.requiredRoles.length === 0) && (
                                                        <span className="text-xs text-slate-400 italic">Sin roles requeridos</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    );
                })()}

                {/* Timeline Sections */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Cronograma</h3>
                    {template.sections?.filter((s: any) => s.type !== 'GLOBAL').map((section: any, idx: number) => (
                        <Card key={section.id} className="group hover:ring-1 hover:ring-indigo-100 transition-all">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-8 text-slate-300 font-bold text-lg">
                                    {section.order} {/* We might need to re-calc render index if we exclude global, but order is persistent */}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-800 text-lg">{section.title}</h4>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600" onClick={() => openEditModal(section)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={() => handleDeleteClick(section.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            <Clock className="w-3 h-3" />
                                            {section.defaultDuration} min
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* <Users className="w-3 h-3 text-slate-400" /> */}
                                            <div className="flex gap-1 flex-wrap">
                                                {section.requiredRoles?.map((role: any) => (
                                                    <Badge key={role.id} variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-100">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                                {(!section.requiredRoles || section.requiredRoles.length === 0) && (
                                                    <span className="text-xs text-slate-400 italic">Sin roles requeridos</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog open={isAddSectionOpen} onOpenChange={(open) => {
                setIsAddSectionOpen(open);
                if (!open) resetForm(); // Reset on close
            }}>
                <DialogContent className="max-w-4xl sm:max-w-5xl h-[85vh] flex flex-col p-6 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                            {isEditMode ? 'Editar Sección' : 'Agregar Sección'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveSection} className="flex flex-col gap-6 py-4 flex-1 overflow-hidden px-4">
                        {/* 1. Title at top */}
                        <div className="space-y-2 shrink-0">
                            <Label className="font-bold text-xs uppercase text-slate-500">Título de la Sección</Label>
                            <Input
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: Bienvenida, Alabanza, Prédica..."
                                required
                                className="rounded-xl border-slate-200 text-lg font-bold placeholder:font-normal"
                            />
                        </div>

                        {/* 2. Two Columns Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 flex-1">

                            {/* Left Column: Roles Selection (Full Height with Scroll) */}
                            <div className="md:col-span-8 flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4 min-h-0">
                                <div className="flex justify-between items-center mb-3 shrink-0">
                                    <Label className="font-bold text-xs uppercase text-slate-500">Roles Requeridos</Label>
                                    {selectedMinistry !== 'ALL' && (
                                        <Badge variant="outline" className="text-[9px] bg-white border-slate-200 text-slate-500">
                                            Filtrado por Ministerio
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-1.5 light-scrollbar">
                                    {allDuties
                                        ?.filter((d: any) => selectedMinistry === 'ALL' || d.ministry?.id === selectedMinistry)
                                        .map((duty: any) => {
                                            const isSelected = selectedRoles.includes(duty.id);
                                            return (
                                                <div
                                                    key={duty.id}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${isSelected
                                                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                                        : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'}`}
                                                    onClick={() => toggleRoleSelection(duty.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-slate-50'}`}>
                                                            {isSelected && <ArrowDown className="w-3 h-3 text-white" />}
                                                            {/* ArrowDown implies "selected" or just a checkmark */}
                                                        </div>
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                                                            {duty.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {duty.ministry?.name || 'General'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    {(!allDuties || allDuties.filter((d: any) => selectedMinistry === 'ALL' || d.ministry?.id === selectedMinistry).length === 0) && (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                                            <Users className="w-8 h-8 mb-2 opacity-20" />
                                            <p className="text-xs">No hay roles disponibles para este criterio.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Properties & Buttons */}
                            <div className="md:col-span-4 flex flex-col gap-5 h-full">
                                <div className="space-y-4 flex-1">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-xs uppercase text-slate-500">Tipo de Sección</Label>
                                        <Select
                                            name="type"
                                            value={sectionType}
                                            onValueChange={(val) => {
                                                setSectionType(val);
                                                if (val === 'GLOBAL') setDuration(0);
                                                else if (duration === 0) setDuration(15);
                                            }}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="General" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-200">
                                                <SelectItem value="GENERAL">General (Cronograma)</SelectItem>
                                                <SelectItem value="WORSHIP">Adoración</SelectItem>
                                                <SelectItem value="PREACHING">Predicación</SelectItem>
                                                <SelectItem value="GLOBAL">GLOBAL / TODO EL CULTO</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold text-xs uppercase text-slate-500">Duración Estimada (min)</Label>
                                        <div className="relative">
                                            <Input
                                                name="defaultDuration"
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                                disabled={sectionType === 'GLOBAL'}
                                                className="rounded-xl border-slate-200 pl-10 disabled:opacity-50 disabled:bg-slate-100"
                                            />
                                            <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold text-xs uppercase text-slate-500">Ministerio a Cargo (Opcional)</Label>
                                        <Select name="ministryId" value={selectedMinistry} onValueChange={(val) => setSelectedMinistry(val)}>
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="-- Sin asignar --" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-200">
                                                <SelectItem value="ALL" className="font-bold text-slate-500">-- Sin asignar / General --</SelectItem>
                                                {Array.from(new Set((allDuties || []).map((d: any) => d.ministry).filter(Boolean).map((m: any) => JSON.stringify({ id: m.id, name: m.name }))))
                                                    .map((str: any) => {
                                                        const m = JSON.parse(str);
                                                        return <SelectItem key={m.id} value={m.id} className="font-medium">{m.name}</SelectItem>;
                                                    })
                                                }
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-slate-400 leading-tight">
                                            Filtrar roles por ministerio.
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons at the bottom of Right Column */}
                                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 mt-auto">
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl h-12 shadow-lg shadow-indigo-200">
                                        {isEditMode ? 'Actualizar Sección' : 'Guardar Sección'}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setIsAddSectionOpen(false)} className="w-full font-bold text-slate-500 hover:text-slate-800 rounded-xl">
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la sección de la plantilla.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
}
