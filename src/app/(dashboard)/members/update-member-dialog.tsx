import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { EcclesiasticalRole, MembershipStatus, FunctionalRole } from '@/types/auth-types';
import { ROLE_UI_METADATA } from '@/constants/role-ui';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

interface UpdateMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    onSuccess: () => void;
}

export function UpdateMemberDialog({ isOpen, onClose, member, onSuccess }: UpdateMemberDialogProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<EcclesiasticalRole>(EcclesiasticalRole.NONE);
    const [functionalRoles, setFunctionalRoles] = useState<FunctionalRole[]>([]);
    const [status, setStatus] = useState<MembershipStatus>(MembershipStatus.MEMBER);

    // Personal fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [documentId, setDocumentId] = useState('');

    const hasUser = member?.person?.user;

    useEffect(() => {
        if (member) {
            setRole(member.ecclesiasticalRole || EcclesiasticalRole.NONE);
            setFunctionalRoles(member.functionalRoles || []);
            setStatus(member.membershipStatus || MembershipStatus.MEMBER);
            setFullName(member.person?.fullName || '');
            setEmail(member.person?.email || '');
            setPhoneNumber(member.person?.phoneNumber || '');
            setDocumentId(member.person?.documentId || '');
        }
    }, [member]);

    const handleSave = async () => {
        // Double check self-demotion in frontend
        const isSelf = user?.memberId === member?.id;
        const willHaveAdmin = functionalRoles.includes(FunctionalRole.ADMIN_CHURCH);
        const hadAdmin = member?.functionalRoles?.includes(FunctionalRole.ADMIN_CHURCH);

        if (isSelf && hadAdmin && !willHaveAdmin) {
            toast.error("No puedes quitarte el rol de Administrador de Iglesia a ti mismo.");
            return;
        }

        setLoading(true);
        try {
            await api.patch(`/members/${member.id}`, {
                ecclesiasticalRole: role,
                functionalRoles: functionalRoles,
                status: status,
                // Send personal fields if no user
                ...(hasUser ? {} : {
                    fullName,
                    email,
                    phoneNumber,
                    documentId
                })
            });
            toast.success('Miembro actualizado correctamente');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Error al actualizar el miembro';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Actualizar Miembro</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {!hasUser && (
                        <div className="space-y-4 border-b pb-4 mb-2">
                            <p className="text-sm text-gray-500 font-medium">Información Personal (Editables: Sin Usuario)</p>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Nombre</Label>
                                <Input className="col-span-3" value={fullName} onChange={e => setFullName(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Email</Label>
                                <Input className="col-span-3" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Teléfono</Label>
                                <Input className="col-span-3" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">DNI / Doc</Label>
                                <Input className="col-span-3" value={documentId} onChange={e => setDocumentId(e.target.value)} />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                            Funciones
                        </Label>
                        <div className="col-span-3">
                            <div className="flex flex-wrap gap-2">
                                {Object.values(FunctionalRole)
                                    .filter(r => r !== FunctionalRole.MEMBER) // Exclude MEMBER from explicit selection
                                    .map((r) => {
                                        const isSelected = functionalRoles.includes(r);
                                        const meta = ROLE_UI_METADATA[r];

                                        // Specific logic: Prevent removing ADMIN_CHURCH from self
                                        // We check if the member being edited is the current logged-in user
                                        const isSelf = user?.memberId === member?.id;
                                        const isAdminChurch = r === FunctionalRole.ADMIN_CHURCH;
                                        const isDisabled = isSelf && isAdminChurch && isSelected;

                                        return (
                                            <button
                                                key={r}
                                                type="button"
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (isDisabled) return;

                                                    if (isSelected) {
                                                        setFunctionalRoles(functionalRoles.filter(fr => fr !== r));
                                                    } else {
                                                        setFunctionalRoles([...functionalRoles, r]);
                                                    }
                                                }}
                                                className={`
                                                    inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                                                    ${isSelected
                                                        ? `${meta?.color || 'bg-primary text-white'} border-transparent ring-2 ring-offset-1 ring-primary/20`
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                    }
                                                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                {meta?.label || r}
                                                {isDisabled && <span className="ml-1 text-[10px]" title="No puedes quitarte tu propio rol de administrador">(Fijo)</span>}
                                            </button>
                                        );
                                    })}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 ml-1">
                                * Todos los usuarios tienen el rol de Miembro por defecto.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Estado
                        </Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as MembershipStatus)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(MembershipStatus).map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {ROLE_UI_METADATA[s]?.label || s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Rol
                        </Label>
                        <Select value={role} onValueChange={(v) => setRole(v as EcclesiasticalRole)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(EcclesiasticalRole).map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {ROLE_UI_METADATA[r]?.label || r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
