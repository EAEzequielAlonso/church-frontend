import { Metadata } from 'next';
import { MentorshipWizard } from '@/modules/mentorship/components/MentorshipWizard';

export const metadata: Metadata = {
    title: 'Nuevo Proceso | Ecclesia',
    description: 'Crear un nuevo proceso de acompañamiento',
};

export default function NewMentorshipProcessPage() {
    return (
        <MentorshipWizard />
    );
}
