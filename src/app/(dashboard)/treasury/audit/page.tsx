'use client';

import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FunctionalRole, SystemRole } from '@/types/auth-types';
import { AuditTrailViewer } from '@/features/treasury/components/AuditTrailViewer';

export default function TreasuryAuditPage() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return null;

    const canAccessAudit = 
        (user.roles && [FunctionalRole.TREASURER, FunctionalRole.ADMIN_CHURCH, FunctionalRole.AUDITOR].some(role => user.roles?.includes(role)));

    if (!canAccessAudit) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">Acceso Denegado</h1>
                <p className="text-slate-500">No cuentas con los permisos necesarios para visualizar el registro de auditoría financiera.</p>
                <button onClick={() => router.push('/treasury')} className="text-sm font-semibold text-primary hover:underline">
                    Volver a Tesorería
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Suspense fallback={<div>Cargando audit trail...</div>}>
                <AuditTrailViewer />
            </Suspense>
        </div>
    );
}

