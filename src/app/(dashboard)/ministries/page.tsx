'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Plus
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Ministry } from '@/types/ministry';

import { CreateMinistryDialog } from './create-ministry-dialog';
import { MinistryCard } from './components/MinistryCard';

export default function MinistriesPage() {
    const router = useRouter();
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        fetchMinistries();
    }, []);

    const fetchMinistries = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ministries`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al cargar ministerios');
            const data = await res.json();
            setMinistries(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar los ministerios');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ministerios</h1>
                    <p className="text-slate-500 font-medium">Gestión estratégica y operativa de los equipos de servicio.</p>
                </div>

                <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="font-bold gap-2 shadow-xl shadow-primary/20 h-12 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Ministerio
                </Button>
            </div>

            <CreateMinistryDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchMinistries}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ministries.map((ministry) => (
                    <MinistryCard key={ministry.id} ministry={ministry} />
                ))}

                {ministries.length === 0 && (
                    <Card className="col-span-full border-dashed py-20 text-center bg-slate-50/50">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">No hay ministerios registrados</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">Comienza creando un ministerio para organizar tus equipos de servicio.</p>
                        <Button
                            variant="outline"
                            className="mt-6 font-bold border-2"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Crear Primer Ministerio
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
}
