import React, { useState, useEffect } from 'react';
import { groupsApi } from '../api/groups.api';
import { GroupAttendanceDto, RegisterAttendanceDto } from '../types/group.types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface GroupAttendanceProps {
    meetingId: string;
    groupId: string;
    onBack: () => void;
}

export function GroupAttendance({ meetingId, groupId, onBack }: GroupAttendanceProps) {
    const [attendances, setAttendances] = useState<GroupAttendanceDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadAttendance();
    }, [meetingId, groupId]);

    const loadAttendance = async () => {
        setIsLoading(true);
        try {
            const data = await groupsApi.getMeetingAttendance(groupId, meetingId);
            setAttendances(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar la asistencia");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (churchPersonId: string, present: boolean) => {
        setAttendances(prev => prev.map(item => 
            item.churchPerson.id === churchPersonId 
                ? { ...item, present } 
                : item
        ));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload: RegisterAttendanceDto = {
                items: attendances.map(item => ({
                    churchPersonId: item.churchPerson.id,
                    present: item.present
                }))
            };

            await groupsApi.registerAttendance(groupId, meetingId, payload);
            toast.success("Asistencia guardada correctamente");
            onBack();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar asistencia");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h3 className="font-semibold text-slate-800">Registro de Asistencia</h3>
                        <p className="text-sm text-slate-500">Pasa lista para esta reunión específica.</p>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar Asistencia
                </Button>
            </div>

            <div className="p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-medium">Participante</th>
                            <th className="px-6 py-4 font-medium text-center w-48">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {attendances.map((item) => {
                            const isPresent = item.present;

                            return (
                                <tr key={item.churchPerson.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {item.churchPerson.person.fullName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant={isPresent ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleToggle(item.churchPerson.id, true)}
                                                className={isPresent 
                                                    ? "bg-emerald-500 hover:bg-emerald-600 border-none" 
                                                    : "text-slate-400 border-slate-200 hover:border-emerald-200 hover:text-emerald-500"
                                                }
                                            >
                                                <Check className="w-4 h-4 mr-1" /> Presente
                                            </Button>

                                            <Button
                                                variant={!isPresent ? "destructive" : "outline"}
                                                size="sm"
                                                onClick={() => handleToggle(item.churchPerson.id, false)}
                                                className={!isPresent 
                                                    ? "bg-rose-500 hover:bg-rose-600 border-none" 
                                                    : "text-slate-400 border-slate-200 hover:border-rose-200 hover:text-rose-500"
                                                }
                                            >
                                                <X className="w-4 h-4 mr-1" /> Ausente
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {attendances.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <div className="mb-2">No hay participantes inscritos en este grupo para tomar asistencia.</div>
                        <p className="text-xs">Asegúrate de agregar miembros al grupo primero.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
