import { Metadata } from 'next';
import { MentorshipDetail } from '@/modules/mentorship/components/MentorshipDetail';

export const metadata: Metadata = {
    title: 'Detalle de Proceso | Ecclesia',
    description: 'Visualiza el histórico del acompañamiento',
};

export default async function MentorshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Inject the route parameter directly into the component
    const resolvedParams = await params;
    return <MentorshipDetail id={resolvedParams.id} />;
}
