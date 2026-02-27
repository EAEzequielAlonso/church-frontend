'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAddFamilyMember } from '../hooks/useAddFamilyMember';
import { useMemberSearch } from '../hooks/useMemberSearch';
import { MemberSearchResultDto } from '../api/families.api';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FamilyRole } from '../types/family.types';
import { getFamilyRoleLabel, FAMILY_ROLE_LABELS } from '../utils/role.utils';

interface AddFamilyMemberDialogProps {
    familyId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    currentMemberIds: string[];
}

export function AddFamilyMemberDialog({
    familyId,
    open,
    onOpenChange,
    onSuccess,
    currentMemberIds
}: AddFamilyMemberDialogProps) {
    const { execute, isLoading } = useAddFamilyMember();
    const { search, results, isLoading: isSearching, clear } = useMemberSearch();

    const [selectedMember, setSelectedMember] = useState<MemberSearchResultDto | null>(null);
    const [role, setRole] = useState<FamilyRole>('CHILD');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (q: string) => {
        setSearchQuery(q);
        search(q);
    };

    const handleSelect = (member: MemberSearchResultDto) => {
        setSelectedMember(member);
        setSearchQuery('');
        clear();
    };

    const handleSubmit = async () => {
        if (!selectedMember) return;
        const success = await execute(familyId, selectedMember.id, role, () => {
            onSuccess();
            handleClose();
        });
    };

    const handleClose = () => {
        setSelectedMember(null);
        setRole('CHILD');
        setSearchQuery('');
        clear();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Agregar Miembro</DialogTitle>
                    <DialogDescription>
                        Busca un miembro de la iglesia para agregarlo a esta familia.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Buscar Miembro</Label>
                        {!selectedMember ? (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nombre..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                {results.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {results
                                            .filter(r => !currentMemberIds.includes(r.id))
                                            .map(r => (
                                                <div
                                                    key={r.id}
                                                    className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center text-sm"
                                                    onClick={() => handleSelect(r)}
                                                >
                                                    <span>{r.person.fullName}</span>
                                                    <span className="text-xs text-gray-400">{r.status}</span>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-2 border rounded-md bg-indigo-50 border-indigo-100">
                                <span className="font-medium text-sm text-indigo-900">{selectedMember.person.fullName}</span>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)} className="h-6 w-6 p-0 text-indigo-400 hover:text-indigo-600">
                                    X
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Rol Familiar</Label>
                        <Select value={role} onValueChange={(v: FamilyRole) => setRole(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(FAMILY_ROLE_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!selectedMember || isLoading}>
                        {isLoading ? 'Agregando...' : 'Agregar Miembro'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
