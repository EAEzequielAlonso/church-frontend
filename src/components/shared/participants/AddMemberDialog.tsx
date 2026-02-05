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

// --- HELPER TO GET ENDPOINTS ---
const getEndpoints = (type: 'course' | 'small-group', entityId: string) => {
    const base = type === 'course' ? `/courses/${entityId}` : `/small-groups/${entityId}`;
    return {
        addMember: type === 'course' ? `${base}/participants` : `${base}/members`,
        addGuest: `${base}/guests`
    };
};

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entityId: string;
    type: 'course' | 'small-group';
    existingMemberIds?: string[];
    existingVisitorIds?: string[]; // IDs of visitors (FollowUpPerson) already in group
    existingGuestIds?: string[]; // IDs of guests (PersonInvited) already in group
    onSuccess: () => void;
}

// --- SUB-COMPONENTS (Kept internal for simplicity) ---

function MemberSearchPanel({ entityId, type, existingMemberIds = [], onSuccess }: any) {
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
            toast.success(`${member.person.fullName} inscrito correctamente`);
            onSuccess();
            setResults(prev => prev.filter(p => p.id !== member.id));
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al inscribir al miembro';
            toast.error(typeof msg === 'string' ? msg : 'Error al procesar la solicitud');
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input placeholder="Buscar miembro..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <Button onClick={handleSearch} disabled={searching} variant="secondary"><Search className="w-4 h-4" /></Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2 bg-slate-50">
                {results.length === 0 && !searching && <p className="text-sm text-center text-slate-400 py-4">No se encontraron miembros.</p>}
                {results.map(m => (
                    <div key={m.id} className="flex justify-between items-center p-2 bg-white rounded-md border hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={m.person?.profileImage} />
                                <AvatarFallback>{m.person?.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-bold">{m.person?.fullName}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => onAdd(m)} disabled={addingId === m.id}>
                            {addingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-indigo-600" />}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function VisitorSearchPanel({ entityId, type, existingVisitorIds = [], onSuccess }: any) {
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
            toast.success(`${person.firstName} agregado correctamente`);
            onSuccess();
            setResults(prev => prev.filter(p => p.id !== person.id));
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al agregar visitante';
            // Translate generic dupe error if necessary
            if (msg.includes('duplicate') || msg.includes('ya está')) {
                toast.error('Esta persona ya está agregada en el grupo/curso.');
            } else {
                toast.error(typeof msg === 'string' ? msg : 'Error al procesar la solicitud');
            }
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
                {results.length === 0 && !searching && <p className="text-sm text-center text-slate-400 py-4">No se encontraron visitantes.</p>}
                {results.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-white rounded-md border hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                {p.firstName?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{p.firstName} {p.lastName}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => onAdd(p)} disabled={addingId === p.id}>
                            {addingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-blue-600" />}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GuestSearchPanel({ entityId, type, existingGuestIds = [], onSuccess }: any) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);

    const handleSearch = async (e?: any) => {
        if (e) e.preventDefault();
        setSearching(true);
        try {
            const { data } = await api.get(`/courses/search/invited?q=${query}`);
            const filtered = Array.isArray(data) ? data.filter((p: any) => !existingGuestIds.includes(p.id) && !p.followUpPerson) : [];
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
                email: person.email,
                phone: person.phone,
                personInvitedId: person.id
            };
            await api.post(endpoints.addGuest, payload);
            toast.success(`${person.firstName} agregado correctamente`);
            onSuccess();
            setResults(prev => prev.filter(p => p.id !== person.id));
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al agregar invitado';
            if (msg.includes('duplicate') || msg.includes('ya está')) {
                toast.error('Esta persona ya está agregada.');
            } else {
                toast.error(typeof msg === 'string' ? msg : 'Error al procesar la solicitud');
            }
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
                {results.length === 0 && !searching && <p className="text-sm text-center text-slate-400 py-4">No se encontraron invitados anteriores.</p>}
                {results.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-white rounded-md border hover:border-orange-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                {p.firstName?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{p.firstName} {p.lastName}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => onAdd(p)} disabled={addingId === p.id}>
                            {addingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-orange-600" />}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function NewGuestForm({ entityId, type, onSuccess }: any) {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
    const endpoints = getEndpoints(type, entityId);

    const onSubmit = async (data: any) => {
        try {
            const payload = {
                fullName: `${data.firstName} ${data.lastName}`,
                ...data
            };
            await api.post(endpoints.addGuest, payload);
            toast.success('Invitado registrado correctamente');
            reset();
            onSuccess();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al registrar nuevo invitado';
            toast.error(typeof msg === 'string' ? msg : 'Error al procesar la solicitud');
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

// --- EXPORTED COMPONENT ---

export default function AddMemberDialog({ open, onOpenChange, entityId, type, existingMemberIds = [], existingVisitorIds = [], existingGuestIds = [], onSuccess }: AddMemberDialogProps) {
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
                        <MemberSearchPanel entityId={entityId} type={type} existingMemberIds={existingMemberIds} onSuccess={onSuccess} />
                    </TabsContent>
                    <TabsContent value="visitors">
                        <VisitorSearchPanel entityId={entityId} type={type} existingVisitorIds={existingVisitorIds} onSuccess={onSuccess} />
                    </TabsContent>
                    <TabsContent value="guests">
                        <GuestSearchPanel entityId={entityId} type={type} existingGuestIds={existingGuestIds} onSuccess={onSuccess} />
                    </TabsContent>
                    <TabsContent value="new">
                        <NewGuestForm entityId={entityId} type={type} onSuccess={onSuccess} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
