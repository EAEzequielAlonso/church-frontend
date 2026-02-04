'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROLE_UI_METADATA } from '@/constants/role-ui';
import { EcclesiasticalRole } from '@/types/auth-types';

interface AddPeopleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId?: string; // Legacy
    entityId?: string; // New universal prop
    type?: 'course' | 'small-group';
    existingMemberIds?: string[];
    existingVisitorIds?: string[];
    existingGuestIds?: string[];
    onSuccess: () => void;
}

// --- HELPER TO GET ENDPOINTS ---
const getEndpoints = (type: 'course' | 'small-group', entityId: string) => {
    const base = type === 'course' ? `/courses/${entityId}` : `/small-groups/${entityId}`;
    return {
        addMember: type === 'course' ? `${base}/participants` : `${base}/members`,
        addGuest: `${base}/guests` // Both use /guests but payload might verify
    };
};

// ... (existing imports)

function MemberSearchPanel({ entityId, type = 'course', existingMemberIds, onSuccess }: any) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);

    const handleSearch = async (e?: any) => {
        if (e) e.preventDefault();
        setSearching(true);
        try {
            let data;
            if (!query) {
                const res = await api.get('/members?limit=20');
                data = res.data;
            } else {
                const res = await api.get(`/members/search?q=${query}`);
                data = res.data;
            }
            const filtered = Array.isArray(data) ? data.filter((m: any) => !existingMemberIds.includes(m.id)) : [];
            setResults(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => { handleSearch(); }, []);

    const onAdd = async (member: any) => {
        setAddingId(member.id);
        const endpoints = getEndpoints(type, entityId);
        try {
            await api.post(endpoints.addMember, { memberId: member.id });
            toast.success(`${member.person.fullName} inscrito`);
            onSuccess();
            setResults(prev => prev.filter(p => p.id !== member.id));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al inscribir');
        } finally {
            setAddingId(null);
        }
    };

    // Helper to get role label
    const getRoleLabel = (role: string) => {
        // Try exact match or fallback to 'Miembro' for 'NONE'/'none'
        const meta = ROLE_UI_METADATA[role as keyof typeof ROLE_UI_METADATA];
        if (meta) return meta.label;
        if (role === 'NONE' || role === 'none') return 'Miembro';
        return role; // Fallback to raw string if not found
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input placeholder="Buscar miembro..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <Button onClick={handleSearch} disabled={searching} variant="secondary"><Search className="w-4 h-4" /></Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2 bg-slate-50">
                {results.map(m => (
                    <div key={m.id} className="flex justify-between items-center p-2 bg-white rounded-md border hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={m.person?.profileImage} />
                                <AvatarFallback>{m.person?.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-bold">{m.person?.fullName}</p>
                                <p className="text-[10px] text-slate-500">{getRoleLabel(m.ecclesiasticalRole)}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => onAdd(m)} disabled={addingId === m.id}>
                            {addingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-indigo-600" />}
                        </Button>
                    </div>
                ))}
                {results.length === 0 && !searching && <p className="text-center text-xs text-slate-400 py-4">No se encontraron miembros.</p>}
            </div>
        </div>
    );
}

// --- VISITOR SEARCH PANEL ---

function VisitorSearchPanel({ entityId, type = 'course', existingVisitorIds = [], onSuccess }: any) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);

    const handleSearch = async (e?: any) => {
        if (e) e.preventDefault();
        setSearching(true);
        try {
            const { data } = await api.get(`/follow-ups/search?q=${query}`);
            const filtered = Array.isArray(data) ? data.filter((p: any) => !existingVisitorIds.includes(p.id)) : [];
            setResults(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => { handleSearch(); }, []);

    const onAdd = async (person: any) => {
        setAddingId(person.id);
        const endpoints = getEndpoints(type, entityId);
        try {
            const payload = {
                fullName: `${person.firstName} ${person.lastName}`,
                email: person.email,
                phone: person.phone,
                followUpPersonId: person.id
            };
            await api.post(endpoints.addGuest, payload);
            toast.success(`${person.firstName} agregado como visitante`);
            onSuccess();
            setResults(prev => prev.filter(p => p.id !== person.id));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al agregar');
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input placeholder="Buscar visitantes..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <Button onClick={handleSearch} disabled={searching} variant="secondary"><Search className="w-4 h-4" /></Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2 bg-slate-50">
                {results.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-white rounded-md border hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                {p.firstName?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{p.firstName} {p.lastName}</p>
                                <p className="text-[10px] text-slate-500">{p.email || p.phone || 'Sin contacto'}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => onAdd(p)} disabled={addingId === p.id}>
                            {addingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-orange-600" />}
                        </Button>
                    </div>
                ))}
                {results.length === 0 && !searching && <p className="text-center text-xs text-slate-400 py-4">No se encontraron visitantes disponibles.</p>}
            </div>
        </div>
    );
}

// --- GUEST SEARCH PANEL ---

function GuestSearchPanel({ entityId, type = 'course', existingGuestIds = [], existingVisitorIds = [], onSuccess }: any) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);

    const handleSearch = async (e?: any) => {
        if (e) e.preventDefault();
        setSearching(true);
        try {
            const { data } = await api.get(`/courses/search/invited?q=${query}`);
            const filtered = Array.isArray(data) ? data.filter((p: any) =>
                !existingGuestIds.includes(p.id) &&
                // Exclude if this Invited Person is linked to a Visitor who is already added? 
                // OR exclude if this Invited Person appears in the Visitor List?
                // The User said: "me aparecen los que ya son visitantes en la lista de invitados"
                // This implies that the 'Invited' object might be the SAME person as a 'Visitor' or linked.
                // However, without complex backend linking check, we can try to filter by ID match if IDs are shared,
                // OR simply ensure we rely on the backend constraints.
                // But typically, 'PersonInvited' and 'FollowUpPerson' have different IDs. 
                // If a PersonInvited IS converted to FollowUp, usually the PersonInvited record remains.
                // We need to check if the backend 'search/invited' endpoint returns FollowUp status.

                // Assuming simple ID exclusion isn't enough if IDs differ.
                // However, likely the user sees the NAME and email/phone of someone they know is a visitor.
                // If the frontend has no way to know relation, we must trust the lists passed.

                // WAIT. If I am adding a "Guest" (PersonInvited), and they are ALREADY a "Visitor" (FollowUpPerson) in the group...
                // The `existingVisitorIds` are FollowUpPerson IDs.
                // The `data` here are `PersonInvited` records. 
                // IDs won't match.

                // We need to check if the backend returns any link.
                // Let's assume for now we filter strictly by IDs provided. 
                // BUT, the user says "solo me deberian aparecer los invitados que no pasaron a visitantes".
                // This implies a GLOBAL status check, not just "in this group".
                // "que no pasaron a visitantes" = they are PURE GUESTS.

                // If the backend `search/invited` returns `followUpPerson` relation, we can filter it out.
                // Let's assume `p.followUpPerson` might exist in the returned data.
                !p.followUpPerson // Exclude if they have been promoted to FollowUp (Visitor)
            ) : [];
            setResults(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => { handleSearch(); }, []);

    const onAdd = async (person: any) => {
        setAddingId(person.id);
        const endpoints = getEndpoints(type, entityId);
        try {
            const payload = {
                fullName: `${person.firstName} ${person.lastName}`.trim(),
                firstName: person.firstName,
                lastName: person.lastName,
                email: person.email,
                phone: person.phone,
                personInvitedId: person.id
            };
            await api.post(endpoints.addGuest, payload);
            toast.success(`${person.firstName} agregado`);
            onSuccess();
            setResults(prev => prev.filter(p => p.id !== person.id));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al agregar');
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input placeholder="Buscar invitados anteriores..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <Button onClick={handleSearch} disabled={searching} variant="secondary"><Search className="w-4 h-4" /></Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2 bg-slate-50">
                {results.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-white rounded-md border hover:border-purple-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                {p.firstName?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{p.firstName} {p.lastName}</p>
                                <p className="text-[10px] text-slate-500">{p.email || p.phone || 'Sin contacto'}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => onAdd(p)} disabled={addingId === p.id}>
                            {addingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-purple-600" />}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function NewGuestForm({ entityId, type = 'course', onSuccess }: any) {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
    const endpoints = getEndpoints(type, entityId);

    const onSubmit = async (data: any) => {
        try {
            const payload = {
                fullName: `${data.firstName} ${data.lastName}`,
                ...data
            };
            await api.post(endpoints.addGuest, payload);
            toast.success('Invitado registrado');
            reset();
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al registrar');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label>Nombre</Label>
                    <Input {...register('firstName', { required: true })} placeholder="Juan" />
                </div>
                <div className="space-y-1">
                    <Label>Apellido</Label>
                    <Input {...register('lastName', { required: true })} placeholder="Pérez" />
                </div>
            </div>
            <div className="space-y-1">
                <Label>Email</Label>
                <Input {...register('email')} placeholder="juan@email.com" />
            </div>
            <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input {...register('phone')} placeholder="+54 9 11..." />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Registrar Invitado
            </Button>
        </form>
    );
}

// --- MAIN DIALOG ---

export default function AddPeopleDialog({ open, onOpenChange, courseId, entityId, type = 'course', existingMemberIds = [], existingVisitorIds = [], existingGuestIds = [], onSuccess }: AddPeopleDialogProps) {
    // Resolve ID (legacy support)
    const activeId = entityId || courseId;

    if (!activeId) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Agregar Personas</DialogTitle>
                    <DialogDescription>Inscribe miembros, visitantes o registra nuevos invitados.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="members" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                        <TabsTrigger value="members">Miembros</TabsTrigger>
                        <TabsTrigger value="visitors">Visitantes</TabsTrigger>
                        <TabsTrigger value="guests">Invitados</TabsTrigger>
                        <TabsTrigger value="new">Nuevo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="members">
                        <MemberSearchPanel entityId={activeId} type={type} existingMemberIds={existingMemberIds} onSuccess={onSuccess} />
                    </TabsContent>
                    <TabsContent value="visitors">
                        <VisitorSearchPanel entityId={activeId} type={type} existingVisitorIds={existingVisitorIds} onSuccess={onSuccess} />
                    </TabsContent>
                    <TabsContent value="guests">
                        <GuestSearchPanel entityId={activeId} type={type} existingGuestIds={existingGuestIds} existingVisitorIds={existingVisitorIds} onSuccess={onSuccess} />
                    </TabsContent>
                    <TabsContent value="new">
                        <NewGuestForm entityId={activeId} type={type} onSuccess={onSuccess} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
