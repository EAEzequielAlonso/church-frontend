import { FollowupDetail } from '@/features/followups/components/FollowupDetail';

export default function FollowupDetailPage({ params }: { params: { id: string } }) {
    return <FollowupDetail id={params.id} />;
}
