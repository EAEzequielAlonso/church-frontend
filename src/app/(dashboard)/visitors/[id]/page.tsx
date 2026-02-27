"use client";

import { useFollowUpDetail } from '@/hooks/useFollowUpDetail';
import { FollowUpDetail } from '@/components/FollowUp/FollowUpDetail';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function VisitorDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { data, loading, error } = useFollowUpDetail(id);

    if (loading) {
        return <div className="p-8 text-center">Cargando detalle...</div>;
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error || 'No se encontró el seguimiento'}</p>
                <Button onClick={() => router.back()}>Volver</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {data.firstName} {data.lastName}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Detalle de seguimiento
                    </p>
                </div>
            </div>

            <FollowUpDetail detail={data} />
        </div>
    );
}
