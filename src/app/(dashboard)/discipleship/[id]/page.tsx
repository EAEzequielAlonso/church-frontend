'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import DiscipleshipDetailView from '@/components/discipleship/DiscipleshipDetailView';
import { DiscipleshipRole } from '@/types/discipleship';

export default function DiscipleshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Correctly unwrap params using React.use()
    const { id } = use(params);
    const [discipleship, setDiscipleship] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (id) {
            fetchDiscipleship(id);
        }
    }, [id]);

    const fetchDiscipleship = async (discipleshipId: string) => {
        try {
            const res = await api.get(`/discipleships/${discipleshipId}`);
            setDiscipleship(res.data);
        } catch (error) {
            // toast.error('Error cargando detalles del discipulado');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (!discipleship) return <div className="p-8 text-center text-gray-500">Discipulado no encontrado o no tienes acceso.</div>;

    // Determine Role
    const myParticipant = discipleship.participants.find((p: any) => p.member?.person?.id === user?.personId);
    let myRole = myParticipant?.role;

    // Check if I am a Supervisor/Admin not in list? 
    if (!myRole && user?.systemRole === 'ADMIN_APP') myRole = DiscipleshipRole.SUPERVISOR;

    return (
        <DiscipleshipDetailView
            discipleship={discipleship}
            refresh={() => fetchDiscipleship(id)}
            myRole={myRole}
            userId={user?.memberId} // Pass memberId for simpler checks
        />
    );
}
