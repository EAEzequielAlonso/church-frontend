'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, ArrowLeft, Check, Shield, User, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MemberSearchDialog } from '@/components/counseling/MemberSearchDialog';

export default function NewCounselingProcessPage() {
    const [step, setStep] = useState(1);
    const [type, setType] = useState<'INFORMAL' | 'FORMAL' | null>(null);
    const [selectedMember, setSelectedMember] = useState<any>(null); // Store full member object
    const [openSearch, setOpenSearch] = useState(false);

    // Derived for backward compat if needed, or just use selectedMember.id
    const counseleeId = selectedMember?.id || '';

    const [motive, setMotive] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();

                // authorized if: Platform Admin OR Church Admin (Role 'ADMIN') OR isAuthorizedCounselor
                const isPlatAdmin = userData.isPlatformAdmin;
                const isChurchAdmin = userData.roles?.some((r: any) =>
                    (typeof r === 'string' ? r : r.name)?.toUpperCase() === 'ADMIN'
                );

                const isCounselor = userData.roles?.some((r: any) =>
                    (typeof r === 'string' ? r : r.name)?.toUpperCase() === 'COUNSELOR'
                );

                // We need to check the member profile for isAuthorizedCounselor
                // auth/me usually returns the user, but let's check if it has the member info.
                // If not, we fetch it.
                if (userData.person?.memberships) {
                    const activeChurchId = userData.churchId;
                    const memberProfile = userData.person.memberships.find((m: any) => m.churchId === activeChurchId);
                    setIsAuthorized(memberProfile?.isAuthorizedCounselor || isPlatAdmin || isChurchAdmin || isCounselor);
                } else {
                    // Fallback or retry with member details if needed
                    setIsAuthorized(isPlatAdmin || isChurchAdmin || isCounselor);
                }
            }
        } catch (error) {
            console.error('Error fetching user profile', error);
        }
    };

    // Removed fetchMembers effect as it is no longer needed with search dialog

    // Removed fetchMembers function

    const handleSubmit = async () => {
        if (!type || !motive) {
            toast.error('Completa los campos requeridos');
            return;
        }
        if (type === 'FORMAL' && !selectedMember) {
            toast.error('Selecciona a la persona a aconsejar');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/counseling`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type,
                    counseleeId: selectedMember.id,
                    motive
                })
            });

            if (res.ok) {
                toast.success('Proceso iniciado correctamente');
                router.push('/counseling');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Error al crear proceso');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Iniciar Acompañamiento</h1>
                    <p className="text-slate-500 text-sm">Paso {step} de 3</p>
                </div>
            </div>

            {/* STEP 1: TYPE */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <h2 className="text-xl font-semibold">¿Qué tipo de proceso deseas iniciar?</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card
                            className={`cursor-pointer transition-all hover:border-primary ${type === 'INFORMAL' ? 'border-primary ring-2 ring-primary/20 bg-blue-50/50' : ''}`}
                            onClick={() => setType('INFORMAL')}
                        >
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    Informal / Personal
                                    {type === 'INFORMAL' && <Check className="w-5 h-5 text-primary" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Este acompañamiento es privado y unilateral. Se utiliza para llevar notas personales, motivos de oración y seguimiento personal.
                                </p>
                                <ul className="text-xs text-gray-500 space-y-1">
                                    <li>• No notifica a la otra persona</li>
                                    <li>• No incluye sesiones formales</li>
                                    <li>• Notas 100% privadas</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card
                            className={`transition-all ${!isAuthorized
                                ? 'opacity-60 grayscale cursor-not-allowed border-dashed bg-slate-50'
                                : 'cursor-pointer hover:border-primary'
                                } ${type === 'FORMAL' ? 'border-primary ring-2 ring-primary/20 bg-blue-50/50' : ''}`}
                            onClick={() => isAuthorized && setType('FORMAL')}
                        >
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center text-base">
                                    <div className="flex items-center gap-2">
                                        Formal / Discipulado
                                        {!isAuthorized && <Shield className="w-3.5 h-3.5 text-slate-400" />}
                                    </div>
                                    {type === 'FORMAL' && <Check className="w-5 h-5 text-primary" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Ambas partes conocen y aceptan el proceso. Permite programar sesiones, asignar tareas y supervisión pastoral.
                                </p>
                                {!isAuthorized ? (
                                    <div className="p-2 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-700 font-medium">
                                        ⚠️ Requiere autorización de administración para procesos formales.
                                    </div>
                                ) : (
                                    <ul className="text-xs text-gray-500 space-y-1">
                                        <li>• Requiere aceptación del aconsejado</li>
                                        <li>• Gestión de sesiones y tareas</li>
                                        <li>• Notas compartidas opcionales</li>
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button disabled={!type} onClick={() => setStep(2)}>
                            Continuar
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <h2 className="text-xl font-semibold">Detalles del Acompañamiento</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>¿A quién vas a aconsejar?</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                    onClick={() => setOpenSearch(true)}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    {selectedMember ? (selectedMember.person?.fullName || 'Miembro seleccionado') : "Buscar miembro..."}
                                </Button>
                            </div>

                            <MemberSearchDialog
                                open={openSearch}
                                onOpenChange={setOpenSearch}
                                onSelect={(member) => setSelectedMember(member)}
                            />
                            {type === 'FORMAL' && (
                                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Esta persona recibirá una solicitud para aceptar el proceso.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Motivo o Título del Proceso</Label>
                            <Input
                                placeholder="Ej: Acompañamiento Prematrimonial, Acompañamiento espiritual..."
                                value={motive}
                                onChange={(e) => setMotive(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setStep(1)}>Atrás</Button>
                        <Button disabled={!motive || (type === 'FORMAL' && !selectedMember)} onClick={() => setStep(3)}>
                            Revisar y Confirmar
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: CONFIRMATION */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-yellow-800">
                        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold mb-1">Recordatorio Ético</p>
                            <p>
                                Este proceso es de acompañamiento espiritual y cuidado mutuo, no clínico. Toda la información registrada debe tratarse con
                                estricta confidencialidad, sabiduría y amor cristiano.
                                {type === 'FORMAL' && " Al ser un proceso formal, estás asumiendo un compromiso de acompañamiento responsable ante Dios y la iglesia."}
                            </p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen del Proceso</CardTitle>
                            <CardDescription>Verifica la información antes de iniciar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Tipo</span>
                                <span className="font-medium">{type === 'INFORMAL' ? 'Informal (Privado)' : 'Formal (Discipulado)'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Aconsejado</span>
                                <span className="font-medium">
                                    <span className="font-medium">
                                        {selectedMember?.person?.fullName || 'No especificado'}
                                    </span>
                                </span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Motivo</span>
                                <span className="font-medium">{motive}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(2)}>Editar</Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Iniciar Acompañamiento
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
