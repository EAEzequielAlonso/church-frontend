'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreateFamilyDto, CreateFamilyMemberInput, FamilyRole } from '../types/family.types';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useMemberSearch } from '../hooks/useMemberSearch';
import { MemberSearchResultDto } from '../api/families.api';
import { MembershipStatus } from '@/types/auth-types';
import { Badge } from '@/components/ui/badge';

interface FamilyFormProps {
    initialData?: { name: string };
    isEdit: boolean;
    onSubmit: (data: any) => Promise<void>;
    // Data is CreateFamilyDto for create, or { name: string } for update
    isLoading: boolean;
    onCancel: () => void;
}

// Augmented type to store display name and profile image
type MemberInputState = CreateFamilyMemberInput & {
    displayName?: string;
    profileImage?: string;
};

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


// Sub-component for adding initial members
function InitialMemberInput({
    role,
    label,
    value,
    onChange,
    allowNew = true
}: {
    role: FamilyRole;
    label: string;
    value: MemberInputState | null;
    onChange: (val: MemberInputState | null) => void;
    allowNew?: boolean;
}) {
    const { search, results, clear } = useMemberSearch();
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'SEARCH' | 'NEW'>('SEARCH');
    // The backend `CreateFamilyUseCase` supports `newMember` if `memberId` is missing.
    // Let's support both search and quick create.

    // Quick create state
    const [newMemberName, setNewMemberName] = useState({ firstName: '', lastName: '' });

    const handleSelect = (m: MemberSearchResultDto) => {
        onChange({
            role,
            memberId: m.id,
            displayName: m.person.fullName,
            profileImage: m.person.profileImage
        });
        setQuery('');
        clear();
    };

    const handleNewMemberChange = (field: 'firstName' | 'lastName', val: string) => {
        const updated = { ...newMemberName, [field]: val };
        setNewMemberName(updated);
        onChange({
            role,
            newMember: {
                firstName: updated.firstName,
                lastName: updated.lastName,
                status: role === 'CHILD' ? MembershipStatus.CHILD : MembershipStatus.MEMBER
            }
        });
    };

    if (value) {
        return (
            <div className="border p-3 rounded-md bg-slate-50 relative">
                <Label className="text-xs font-bold uppercase text-slate-500 mb-1 block">{label}</Label>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {value.memberId && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={value.profileImage} />
                                <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                                    {value.displayName?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <span className="text-sm font-medium">
                            {value.memberId
                                ? (value.displayName || 'Miembro Existente')
                                : `${value.newMember?.firstName} ${value.newMember?.lastName}`
                            }
                        </span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange(null)}
                        className="h-6 w-6 p-0 text-red-400"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="border p-3 rounded-md space-y-2">
            <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase text-slate-500">{label}</Label>
                <div className="text-[10px] space-x-2">
                    {allowNew && (
                        <>
                            <span
                                className={`cursor-pointer ${mode === 'SEARCH' ? 'font-bold text-indigo-600' : 'text-slate-400'}`}
                                onClick={() => setMode('SEARCH')}
                            >
                                Buscar
                            </span>
                            <span>|</span>
                            <span
                                className={`cursor-pointer ${mode === 'NEW' ? 'font-bold text-indigo-600' : 'text-slate-400'}`}
                                onClick={() => setMode('NEW')}
                            >
                                Crear
                            </span>
                        </>
                    )}
                </div>
            </div>

            {mode === 'SEARCH' ? (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <Input
                        placeholder="Buscar..."
                        className="pl-8 h-8 text-sm"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
                    />
                    {results.length > 0 && query.length > 1 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-md max-h-40 overflow-y-auto">
                            {results.map(r => (
                                <div key={r.id} className="p-2 hover:bg-slate-50 cursor-pointer text-xs" onClick={() => handleSelect(r)}>
                                    {r.person.fullName}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        placeholder="Nombre"
                        className="h-8 text-sm"
                        value={newMemberName.firstName}
                        onChange={(e) => handleNewMemberChange('firstName', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                    <Input
                        placeholder="Apellido"
                        className="h-8 text-sm"
                        value={newMemberName.lastName}
                        onChange={(e) => handleNewMemberChange('lastName', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                </div>
            )}
        </div>
    );
}

export function FamilyForm({ initialData, isEdit, onSubmit, isLoading, onCancel }: FamilyFormProps) {
    const [name, setName] = useState(initialData?.name || '');

    // Initial Members State (Only for Create Mode)
    // Initial Members State (Only for Create Mode)
    const [father, setFather] = useState<MemberInputState | null>(null);
    const [mother, setMother] = useState<MemberInputState | null>(null);
    const [children, setChildren] = useState<CreateFamilyMemberInput[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            onSubmit({ name });
        } else {
            const cleanMember = (m: MemberInputState): CreateFamilyMemberInput => {
                const { displayName, profileImage, ...rest } = m;
                return rest;
            };

            const members: CreateFamilyMemberInput[] = [];
            if (father) members.push(cleanMember(father));
            if (mother) members.push(cleanMember(mother));
            members.push(...children); // children are already clean CreateFamilyMemberInput (no display name logic there yet?) 
            // wait, children definition is `CreateFamilyMemberInput[]` in state, but let's check if we added extra props there too. 
            // In `addChild`, we push `{ role: 'CHILD', newMember: ... }`. Use logic doesn't add displayName to children yet (only distinct inputs). 
            // But strict typing in sanitize function is safer.

            onSubmit({
                name,
                members
            } as CreateFamilyDto);
        }
    };

    const addChild = () => {
        setChildren([...children, {
            role: 'CHILD',
            newMember: { firstName: '', lastName: '', status: MembershipStatus.CHILD }
        }]);
    };

    const updateChild = (index: number, field: string, val: string) => {
        const newChildren = [...children];
        if (newChildren[index].newMember) {
            // @ts-ignore
            newChildren[index].newMember[field] = val;
            setChildren(newChildren);
        }
    };

    const removeChild = (index: number) => {
        setChildren(children.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label>Nombre de la Familia</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Familia Pérez"
                    required
                />
            </div>

            {!isEdit && (
                <div className="space-y-4 pt-2 border-t">
                    <Label className="text-sm font-medium text-slate-700">Integrantes Iniciales</Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InitialMemberInput role="FATHER" label="Padre" value={father} onChange={setFather} allowNew={false} />
                        <InitialMemberInput role="MOTHER" label="Madre" value={mother} onChange={setMother} allowNew={false} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold uppercase text-slate-500">Hijos (Nuevos Registros)</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addChild} className="h-6 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Agregar Hijo
                            </Button>
                        </div>

                        {children.map((child, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <Input
                                    placeholder="Nombre"
                                    className="h-8 text-sm"
                                    value={child.newMember?.firstName}
                                    onChange={(e) => updateChild(idx, 'firstName', e.target.value)}
                                />
                                <Input
                                    placeholder="Apellido"
                                    className="h-8 text-sm"
                                    value={child.newMember?.lastName}
                                    onChange={(e) => updateChild(idx, 'lastName', e.target.value)}
                                />
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeChild(idx)} className="h-8 w-8 p-0 text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {children.length === 0 && <p className="text-xs text-slate-400 italic">No hay hijos agregados.</p>}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                    {isLoading ? 'Guardando...' : (isEdit ? 'Actualizar Nombre' : 'Crear Familia')}
                </Button>
            </div>
        </form>
    );
}
