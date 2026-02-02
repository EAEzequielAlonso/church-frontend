'use client';

import { useState } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/button';
import { Plus, Heart, History, ChevronLeft, ChevronRight, MessageSquareQuote } from 'lucide-react';
import useSWR from 'swr';
import api from '@/lib/api';
import PrayerCard from '@/components/prayers/PrayerCard';
import PrayerRequestDialog from '@/components/prayers/PrayerRequestDialog';
import AnswerPrayerDialog from '@/components/prayers/AnswerPrayerDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function PrayerWallPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<any>(null);
    const [answeringRequest, setAnsweringRequest] = useState<any>(null);

    // State
    const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'ANSWERED'
    const [page, setPage] = useState(1);
    const limit = 10;

    // Fetch with proper status filter
    // If activeTab is ACTIVE, we fetch ACTIVE. If ANSWERED, fetch ANSWERED.
    const statusFilter = activeTab;

    const { data: response, isLoading, mutate } = useSWR(
        `/prayers?page=${page}&limit=${limit}&status=${statusFilter}`,
        async (url) => (await api.get(url)).data
    );

    const prayers = response?.data || [];
    const meta = response?.meta;

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setPage(1); // Reset page on tab change
    };

    const handleEdit = (req: any) => {
        setEditingRequest(req);
        setIsCreateOpen(true);
    };

    const handleAnswer = (req: any) => {
        setAnsweringRequest(req);
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await api.put(`/prayers/${id}/status`, { status });
            toast.success(`Estado actualizado a ${status}`);
            mutate();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    const handleToggleHidden = async (id: string, isHidden: boolean) => {
        try {
            await api.put(`/prayers/${id}/hidden`, { isHidden });
            toast.success(isHidden ? 'Petición ocultada' : 'Petición visible nuevamente');
            mutate();
        } catch (error) {
            toast.error('Error al cambiar visibilidad');
        }
    };

    const handleDialogSuccess = () => {
        setEditingRequest(null);
        mutate();
    };

    const PaginationControls = () => {
        if (!meta || meta.total === 0) return null;

        return (
            <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                    Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, meta.total)} de {meta.total}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium px-2">Página {page} de {meta.lastPage || 1}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                        disabled={page >= (meta.lastPage || 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <PageContainer
            title="Muro de Oración"
            description="Llevad las cargas los unos de los otros."
            headerAction={
                <Button onClick={() => { setEditingRequest(null); setIsCreateOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Petición
                </Button>
            }
        >
            <div className="max-w-4xl mx-auto mt-6">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
                        <TabsTrigger value="ACTIVE" className="font-semibold">
                            <Heart className="w-4 h-4 mr-2 text-indigo-500" />
                            Peticiones Vigentes
                        </TabsTrigger>
                        <TabsTrigger value="ANSWERED" className="font-semibold">
                            <MessageSquareQuote className="w-4 h-4 mr-2 text-emerald-500" />
                            Testimonios
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ACTIVE" className="space-y-6">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                        ) : prayers.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-600">No hay peticiones vigentes</h3>
                                <p className="text-slate-400 mt-1 max-w-sm mx-auto">Sé el primero en compartir un motivo de oración con la iglesia.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {prayers.map((req: any) => (
                                    <PrayerCard
                                        key={req.id}
                                        request={req}
                                        onEdit={handleEdit}
                                        onAnswer={handleAnswer}
                                        onStatusChange={handleStatusChange}
                                        onToggleHidden={handleToggleHidden}
                                    />
                                ))}
                            </div>
                        )}
                        <PaginationControls />
                    </TabsContent>

                    <TabsContent value="ANSWERED" className="space-y-6">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                        ) : prayers.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-600">Aún no hay testimonios</h3>
                                <p className="text-slate-400 mt-1">Aquí aparecerán las oraciones respondidas.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {prayers.map((req: any) => (
                                    <PrayerCard
                                        key={req.id}
                                        request={req}
                                        onEdit={handleEdit}
                                        onAnswer={handleAnswer}
                                        onStatusChange={handleStatusChange}
                                        onToggleHidden={handleToggleHidden}
                                    />
                                ))}
                            </div>
                        )}
                        <PaginationControls />
                    </TabsContent>
                </Tabs>
            </div>

            <PrayerRequestDialog
                open={isCreateOpen}
                onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setEditingRequest(null); }}
                onSuccess={handleDialogSuccess}
                requestToEdit={editingRequest}
            />

            {answeringRequest && (
                <AnswerPrayerDialog
                    open={!!answeringRequest}
                    onOpenChange={(open) => !open && setAnsweringRequest(null)}
                    onSuccess={handleDialogSuccess}
                    request={answeringRequest}
                />
            )}
        </PageContainer>
    );
}
