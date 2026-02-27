import { useState } from 'react';
import { familiesApi, MemberSearchResultDto } from '../api/families.api';
import { toast } from 'sonner';

export function useMemberSearch() {
    const [results, setResults] = useState<MemberSearchResultDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const search = async (query: string) => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = await familiesApi.searchMembers(query);
            setResults(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al buscar miembros');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const clear = () => setResults([]);

    return { search, results, isLoading, clear };
}
