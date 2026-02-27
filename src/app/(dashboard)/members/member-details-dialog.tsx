import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, BookOpen, Heart, Activity, Phone, MapPin, Mail, FileDown, Pencil } from 'lucide-react';
import { ROLE_UI_METADATA } from '@/constants/role-ui';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { MembershipCertificate } from '@/components/members/MembershipCertificate';

interface MemberDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    loading?: boolean;
    onEdit?: (member: any) => void;
}

export function MemberDetailsDialog({ isOpen, onClose, member, loading, onEdit }: MemberDetailsDialogProps) {
    if (!member) return null;

    const isMember = member.membershipStatus === 'MEMBER' || member.membershipStatus === 'CHILD';
    const hasUser = member.person?.user;
    const canEdit = !hasUser && onEdit;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalle del Miembro</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="py-10 text-center">Cargando información...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Header Profile */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            {member.person?.avatarUrl ? (
                                <img src={member.person.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                    <User className="w-8 h-8" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900">{member.person?.fullName}</h3>
                                <p className="text-slate-500">{member.person?.email}</p>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {member.membershipStatus && ROLE_UI_METADATA[member.membershipStatus as keyof typeof ROLE_UI_METADATA] && (
                                        <Badge className={ROLE_UI_METADATA[member.membershipStatus as keyof typeof ROLE_UI_METADATA].color + " border-0"}>
                                            {ROLE_UI_METADATA[member.membershipStatus as keyof typeof ROLE_UI_METADATA].label}
                                        </Badge>
                                    )}

                                    {member.ecclesiasticalRole && ROLE_UI_METADATA[member.ecclesiasticalRole as keyof typeof ROLE_UI_METADATA] && (
                                        <Badge className={ROLE_UI_METADATA[member.ecclesiasticalRole as keyof typeof ROLE_UI_METADATA].color + " border-0"}>
                                            {ROLE_UI_METADATA[member.ecclesiasticalRole as keyof typeof ROLE_UI_METADATA].label}
                                        </Badge>
                                    )}

                                    <Badge variant="outline" className={hasUser ? "border-blue-200 text-blue-700 bg-blue-50" : "border-gray-200 text-gray-500 bg-gray-50"}>
                                        {hasUser ? 'Con Cuenta de Usuario' : 'Perfil sin Usuario'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {isMember && (
                                    <PDFDownloadLink
                                        document={
                                            <MembershipCertificate
                                                memberName={member.person?.fullName}
                                                documentId={member.person?.documentId}
                                                // churchName fetched from context or hardcoded for now, ideal to pass it
                                                joinDate={new Date(member.joinedAt)}
                                            />
                                        }
                                        fileName={`certificado_${member.person?.fullName.replace(/\s+/g, '_')}.pdf`}
                                    >
                                        {({ blob, url, loading, error }) => (
                                            <Button variant="outline" size="sm" disabled={loading} className="w-full">
                                                <FileDown className="w-4 h-4 mr-2" />
                                                {loading ? 'Generando...' : 'Certificado'}
                                            </Button>
                                        )}
                                    </PDFDownloadLink>
                                )}

                                {canEdit && (
                                    <Button size="sm" onClick={() => onEdit(member)} className="w-full">
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Editar Info
                                    </Button>
                                )}
                            </div>

                        </div>

                        {/* Info Grid */}
                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Información Personal</h4>
                                <div className="text-sm space-y-2 text-slate-600">
                                    <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {member.person?.phoneNumber || 'No registrado'}</p>
                                    <p className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Nacimiento: {member.person?.birthDate ? new Date(member.person.birthDate).toLocaleDateString() : 'N/A'}</p>
                                    <p className="flex items-center gap-2">Documento: {member.person?.documentId || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Church Info */}
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4" /> Vida en la Iglesia</h4>
                                <div className="text-sm space-y-2 text-slate-600">
                                    <p>Miembro desde: {new Date(member.joinedAt).toLocaleDateString()}</p>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium">Discipulado</span>
                                            <Badge variant="secondary">{member.discipleshipStats?.status || 'No iniciado'}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-400">Nivel {member.discipleshipStats?.level || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Counseling Summary (Safe View) */}
                            <div className="md:col-span-2 space-y-4">
                                <h4 className="font-semibold flex items-center gap-2"><Heart className="w-4 h-4" /> Bienestar y Consejería</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-center">
                                        <div className="text-2xl font-bold text-orange-600">{member.counselingStats?.total || 0}</div>
                                        <div className="text-xs text-orange-600 font-medium">Procesos Totales</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                                        <div className="text-2xl font-bold text-green-600">{member.counselingStats?.closed || 0}</div>
                                        <div className="text-xs text-green-600 font-medium">Concluidos</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{member.counselingStats?.open || 0}</div>
                                        <div className="text-xs text-blue-600 font-medium">En Curso</div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 text-center italic mt-2">
                                    * La información detallada de consejería es confidencial y solo accesible por el consejero asignado.
                                </p>
                            </div>

                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
