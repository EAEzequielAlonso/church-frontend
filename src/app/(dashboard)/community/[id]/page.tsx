'use client';

import { use } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import { useGroup } from '@/features/groups/hooks/useGroup';
import { GroupDetail } from '@/features/groups/components/GroupDetail';
import { useAuth } from '@/context/AuthContext';
import { useGroupMutations } from '@/features/groups/hooks/useGroupMutations';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    // Hooks atómicos para el detalle y la membresía
    const { group, isLoading, error, refetch } = useGroup(id);
    const { enroll, disenroll } = useGroupMutations();

    const isAdminOrAuditor = user?.roles?.includes('ADMIN_CHURCH') || user?.roles?.includes('AUDITOR') || user?.systemRole === 'ADMIN_APP';
    const currentMemberId = user?.memberId;

    const handleEnroll = async (memberId: string) => {
        await enroll(id, memberId);
        refetch();
    };

    const handleDisenroll = async (memberId: string) => {
        await disenroll(id, memberId);
        refetch();
    };

    if (isLoading) {
        return (
            <PageContainer title="Cargando...">
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </PageContainer>
        );
    }

    if (error || !group) {
        return (
            <PageContainer title="Grupo no encontrado">
                <div className="text-center py-20">
                    <p className="text-slate-500 mb-4">No se pudo cargar la información o no tienes permisos.</p>
                    <Button onClick={() => router.push('/community')}>Volver a Comunidad</Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title={group.name}
            description={`${group.visibility === 'PUBLIC' ? 'Público' : 'Privado'} • Creado recientemente`}
        >
            <GroupDetail
                group={group}
                isAdminOrAuditor={isAdminOrAuditor || false}
                currentMemberId={currentMemberId}
                onEnroll={handleEnroll}
                onDisenroll={handleDisenroll}
                refetch={refetch}
            />
        </PageContainer>
    );
}
