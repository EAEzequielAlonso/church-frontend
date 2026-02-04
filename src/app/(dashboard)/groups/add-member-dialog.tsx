'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: string;
    existingMemberIds: string[];
    onMemberAdded: () => void;
}

export function AddMemberDialog({ open, onOpenChange, groupId, existingMemberIds, onMemberAdded }: AddMemberDialogProps) {
    const [activeTab, setActiveTab] = useState('members');
    const [members, setMembers] = useState<any[]>([]); // Added missing state
    const [visitors, setVisitors] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState(''); // Added missing state
    const [isLoading, setIsLoading] = useState(false); // Added missing state
    const [isAdding, setIsAdding] = useState(false); // Added missing state

    // Invited Form
    const [invitedName, setInvitedName] = useState('');
    const [invitedEmail, setInvitedEmail] = useState('');

    useEffect(() => {
        if (open) {
            fetchMembers();
            if (activeTab === 'visitors') fetchVisitors();
            setSearchTerm('');
            setInvitedName('');
            setInvitedEmail('');
        }
    }, [open, activeTab]);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Failed to fetch members', error);
            toast.error('Error al cargar miembros');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVisitors = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            // Assuming GET /follow-ups returns visitors or we filter by status if needed
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/follow-ups?status=VISITOR`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setVisitors(data);
            }
        } catch (error) {
            console.error('Failed to fetch visitors', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addMember = async (memberId: string) => {
        if (!memberId) return;
        setIsAdding(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ memberId: memberId })
            });

            if (!res.ok) throw new Error('Error al agregar miembro');
            toast.success('Miembro agregado');
            onMemberAdded();
        } catch (error) {
            toast.error('No se pudo agregar al miembro');
        } finally {
            setIsAdding(false);
        }
    };

    const addVisitor = async (visitorId: string, fullName: string) => {
        if (!visitorId) return;
        setIsAdding(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}/guests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    followUpPersonId: visitorId,
                    fullName: fullName
                })
            });

            if (!res.ok) throw new Error('Error al agregar visitante');
            toast.success('Visitante agregado');
            onMemberAdded();
        } catch (error) {
            toast.error('No se pudo agregar al visitante');
        } finally {
            setIsAdding(false);
        }
    };

    const addInvited = async () => {
        if (!invitedName.trim()) {
            toast.error('El nombre es requerido');
            return;
        }
        setIsAdding(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/small-groups/${groupId}/guests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: invitedName,
                    email: invitedEmail
                })
            });

            if (!res.ok) throw new Error('Error al agregar invitado');
            toast.success('Invitado agregado');
            onMemberAdded();
            setInvitedName('');
            setInvitedEmail('');
        } catch (error) {
            toast.error('No se pudo agregar al invitado');
        } finally {
            setIsAdding(false);
        }
    };

    const filteredMembers = members.filter(m => {
        if (existingMemberIds.includes(m.id)) return false;
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const firstName = m.person?.firstName?.toLowerCase() || '';
        const lastName = m.person?.lastName?.toLowerCase() || '';
        return firstName.includes(searchLower) || lastName.includes(searchLower);
    });

    const filteredVisitors = visitors.filter(v => {
        // TODO: Filter if already in group (need existing guest IDs passed or assume check on backend/frontend parent)
        // For simple UI, we assume list all for now or would need passed existingGuestIds
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const firstName = v.firstName?.toLowerCase() || '';
        const lastName = v.lastName?.toLowerCase() || '';
        return firstName.includes(searchLower) || lastName.includes(searchLower);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Participantes</DialogTitle>
                    <DialogDescription>
                        Selecciona el tipo de participante que deseas agregar al grupo.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="members">Miembros</TabsTrigger>
                        <TabsTrigger value="visitors">Visitantes</TabsTrigger>
                        <TabsTrigger value="invited">Invitados</TabsTrigger>
                    </TabsList>

                    {/* MEMBER TAB */}
                    <TabsContent value="members" className="space-y-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar miembro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="h-[250px] rounded-md border border-slate-100 p-2 overflow-y-auto">
                            {isLoading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> :
                                filteredMembers.length === 0 ? <p className="text-center text-slate-400 p-4">No se encontraron miembros.</p> :
                                    filteredMembers.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded group">
                                            <div className="text-sm font-medium">{member.person?.firstName} {member.person?.lastName}</div>
                                            <Button size="sm" variant="ghost" onClick={() => addMember(member.id)} disabled={isAdding} className="opacity-0 group-hover:opacity-100">
                                                <UserPlus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                        </div>
                    </TabsContent>

                    {/* VISITOR TAB */}
                    <TabsContent value="visitors" className="space-y-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar visitante..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="h-[250px] rounded-md border border-slate-100 p-2 overflow-y-auto">
                            {isLoading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> :
                                filteredVisitors.length === 0 ? <p className="text-center text-slate-400 p-4">No se encontraron visitantes.</p> :
                                    filteredVisitors.map(visitor => (
                                        <div key={visitor.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded group">
                                            <div className="text-sm font-medium">{visitor.firstName} {visitor.lastName}</div>
                                            <Button size="sm" variant="ghost" onClick={() => addVisitor(visitor.id, `${visitor.firstName} ${visitor.lastName}`)} disabled={isAdding} className="opacity-0 group-hover:opacity-100">
                                                <UserPlus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                        </div>
                    </TabsContent>

                    {/* INVITED TAB */}
                    <TabsContent value="invited" className="space-y-4 py-4">
                        <div className="space-y-3">
                            <div>
                                <Label>Nombre Completo</Label>
                                <Input value={invitedName} onChange={e => setInvitedName(e.target.value)} placeholder="Ej: Juan Perez" />
                            </div>
                            <div>
                                <Label>Email (Opcional)</Label>
                                <Input value={invitedEmail} onChange={e => setInvitedEmail(e.target.value)} placeholder="juan@example.com" />
                            </div>
                            <Button className="w-full mt-2" onClick={addInvited} disabled={isAdding || !invitedName}>
                                {isAdding ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Agregar Invitado
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
