
import useSWR from 'swr';
import * as api from '../api/ministry.api';
import { useAuth } from '@/context/AuthContext';
import { MinistryModel } from '../types/ministry.types';

export function useMinistries() {
    const { churchId } = useAuth();
    const { data, error, isLoading } = useSWR(
        churchId ? `/ministries?churchId=${churchId}` : null,
        () => api.getMinistries(churchId!)
    );

    const ministries: MinistryModel[] = data || [];

    return { ministries, isLoading, error };
}
