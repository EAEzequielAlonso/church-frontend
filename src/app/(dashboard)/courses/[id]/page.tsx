'use client';

import { useParams } from 'next/navigation';
import ProgramDetail from '@/features/programs/components/ProgramDetail';

export default function CourseDetailPage() {
    const { id } = useParams();
    return <ProgramDetail id={id as string} />;
}
