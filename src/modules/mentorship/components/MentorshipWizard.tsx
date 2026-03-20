'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { FunctionalRole } from '@/types/auth-types';

import {
    HeartHandshake,
    GraduationCap,
    UserPlus,
    ChevronRight,
    CheckCircle2,
    Loader2,
    Check,
    ChevronsUpDown,
    Building2,
    Coffee,
    X,
    Lock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import {
    createMentorshipSchema,
    CreateMentorshipFormValues
} from '../schemas/create-mentorship.schema';
import { useCreateMentorship } from '../hooks/use-create-mentorship';
import { useChurchPersons } from '@/features/groups/hooks/useChurchPersons';
import { MentorshipType, MentorshipMode } from '../types/mentorship.types';
import { cn } from '@/lib/utils';
import { ChurchPersonDto } from '@/features/groups/types/group.types';

// Sub-component: Searchable Multi-Select Person Combobox
const ParticipantCombobox = ({
    values,
    onChange,
    persons,
    placeholder,
    maxSelections = undefined
}: {
    values: string[],
    onChange: (vals: string[]) => void,
    persons: ChurchPersonDto[],
    placeholder: string,
    maxSelections?: number
}) => {
    const [open, setOpen] = useState(false);

    const handleUnselect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(values.filter(v => v !== id));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "flex min-h-10 w-full flex-wrap items-center justify-between gap-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
                        values.length === 0 && "text-muted-foreground"
                    )}
                    onClick={() => setOpen(!open)}
                >
                    {values.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {values.map((val) => {
                                const p = persons.find((person) => person.id === val);
                                if (!p) return null;
                                return (
                                    <Badge
                                        key={val}
                                        variant="secondary"
                                        className="mr-1 mb-1 font-normal text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200"
                                    >
                                        {p.person?.fullName}
                                        <button
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onClick={(e) => handleUnselect(val, e)}
                                        >
                                            <X className="h-3 w-3 text-slate-500 hover:text-slate-800" />
                                        </button>
                                    </Badge>
                                );
                            })}
                        </div>
                    ) : (
                        <span className="font-normal">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start"
                onPointerDownOutside={(e) => {
                    if (e.target instanceof Element && e.target.closest('[role="combobox"]')) {
                        e.preventDefault();
                    }
                }}>
                <Command
                    filter={(value, search) => {
                        if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                        return 0;
                    }}
                >
                    <CommandInput placeholder="Buscar por nombre o apellido..." autoFocus />
                    <CommandList>
                        <CommandEmpty>No se encontró a nadie.</CommandEmpty>
                        <CommandGroup heading="Miembros Disponibles">
                            {persons.map((p) => {
                                const searchString = `${p.person?.fullName || ''} ${p.person?.email || ''}`.trim();
                                const isSelected = values.includes(p.id);
                                const isDisabled = !isSelected && maxSelections !== undefined && values.length >= maxSelections;

                                return (
                                    <CommandItem
                                        key={p.id}
                                        value={searchString} // Command component uses this value prop for its inner filtering text
                                        onSelect={() => {
                                            if (isSelected) {
                                                onChange(values.filter(v => v !== p.id));
                                            } else {
                                                if (!isDisabled) {
                                                    onChange([...values, p.id]);
                                                }
                                            }
                                            // No cerramos el popover para permitir selección múltiple
                                        }}
                                        className={cn("cursor-pointer", isDisabled && "opacity-50 cursor-not-allowed")}
                                        disabled={isDisabled}
                                    >
                                        <Check
                                            className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100 text-primary" : "opacity-0")}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-800">{p.person?.fullName}</span>
                                            <span className="text-xs text-slate-400">{p.person?.email || 'Sin contacto'}</span>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const STEPS = [
    { id: 1, title: 'Tipo', subtitle: 'Naturaleza del proceso' },
    { id: 2, title: 'Modalidad', subtitle: 'Formal o Informal' },
    { id: 3, title: 'Detalles', subtitle: 'Configuración extra' },
    { id: 4, title: 'Participantes', subtitle: 'Mentores y Guiados' },
    { id: 5, title: 'Confirmar', subtitle: 'Resumen final' }
];

export function MentorshipWizard() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(1);

    const { create, isMutating } = useCreateMentorship();
    const { persons, isLoading: isLoadingPersons } = useChurchPersons();

    const canCreateDiscipleship = user?.roles?.includes(FunctionalRole.ADMIN_CHURCH) ||
        user?.roles?.includes(FunctionalRole.AUDITOR) ||
        user?.roles?.includes(FunctionalRole.DISCIPLER);

    const canCreateCounseling = user?.roles?.includes(FunctionalRole.ADMIN_CHURCH) ||
        user?.roles?.includes(FunctionalRole.AUDITOR) ||
        user?.roles?.includes(FunctionalRole.COUNSELOR);


    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(createMentorshipSchema),
        defaultValues: {
            config: {},
            mentors: [],
            participants: []
        },
        mode: 'onChange'
    });

    const selectedType = watch('type');

    const canSelectFormal = (() => {
        if (selectedType === 'DISCIPLESHIP' && !canCreateDiscipleship) return false;
        if (selectedType === 'COUNSELING' && !canCreateCounseling) return false;
        if (selectedType === 'FOLLOW_UP') {
            const hasAdminOrAuditor = user?.roles?.includes(FunctionalRole.ADMIN_CHURCH) || user?.roles?.includes(FunctionalRole.AUDITOR);
            if (!hasAdminOrAuditor) return false;
        }
        return true;
    })();
    const selectedMode = watch('mode');
    const configData = watch('config');
    const mentorsData = watch('mentors');
    const participantsData = watch('participants');

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];

        if (step === 1) fieldsToValidate = ['type'];
        if (step === 2) fieldsToValidate = ['mode'];
        if (step === 3) {
            fieldsToValidate = ['config.mainTopic'];
        }
        if (step === 4) {
             fieldsToValidate = selectedMode === 'FORMAL' ? ['mentors', 'participants'] : ['participants'];
        }

        const isStepValid = await trigger(fieldsToValidate as any);
        if (isStepValid) {
            // Auto-select INFORMAL if FORMAL is disabled and user is advancing from step 1
            if (step === 1 && !canSelectFormal) {
                setValue('mode', 'INFORMAL', { shouldValidate: true });
            }
            setStep((prev) => Math.min(prev + 1, 5));
        }
    };

    const prevStep = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const onSubmit = async (data: any) => {
        try {
            // Map mainTopic to motive for the API
            const payload = {
                ...data,
                motive: data.config?.mainTopic,
            };
            if (payload.mode === 'INFORMAL') {
                payload.mentors = [{ churchPersonId: user?.memberId || '', hasUserAccount: true }];
            }
            const result = await create(payload as any);
            toast.success('Proceso creado exitosamente');
            router.push(`/mentorship/${result.id}`);
        } catch (error: any) {
            toast.error(error.message || 'Error al crear el proceso');
        }
    };

    // UI Helpers
    const getSelectedPersonName = (id: string) => {
        return persons.find(p => p.id === id)?.person?.fullName || 'Persona Desconocida';
    };

    const getTypeLabel = (t: MentorshipType) => {
        switch (t) {
            case 'DISCIPLESHIP': return 'Discipulado';
            case 'COUNSELING': return 'Consejería';
            case 'FOLLOW_UP': return 'Seguimiento';
            default: return 'Proceso';
        }
    };

    // STEPS RENDERING
    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">¿Qué tipo de proceso deseas iniciar?</h3>
                <p className="text-slate-500 text-sm mt-1">Selecciona la naturaleza del acompañamiento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    onClick={() => setValue('type', 'DISCIPLESHIP', { shouldValidate: true })}
                    className={cn("cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 relative", selectedType === 'DISCIPLESHIP' ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-4 ring-indigo-600/10" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50")}
                >
                    <div className={cn("w-12 h-12 rounded-full mb-4 flex items-center justify-center", selectedType === 'DISCIPLESHIP' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500")}>
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <h4 className={cn("text-lg font-bold mb-1", selectedType === 'DISCIPLESHIP' ? "text-indigo-900" : "text-slate-700")}>Discipulado</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Proceso orientado al crecimiento espiritual y estudio de la Palabra.</p>
                </div>

                <div
                    onClick={() => setValue('type', 'COUNSELING', { shouldValidate: true })}
                    className={cn("cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 relative", selectedType === 'COUNSELING' ? "border-orange-600 bg-orange-50/50 shadow-md ring-4 ring-orange-600/10" : "border-slate-200 hover:border-orange-300 hover:bg-slate-50")}
                >
                    <div className={cn("w-12 h-12 rounded-full mb-4 flex items-center justify-center", selectedType === 'COUNSELING' ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-500")}>
                        <HeartHandshake className="w-6 h-6" />
                    </div>
                    <h4 className={cn("text-lg font-bold mb-1", selectedType === 'COUNSELING' ? "text-orange-900" : "text-slate-700")}>Consejería</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Atención a necesidades emocionales, relacionales o crisis específicas bajo privacidad estricta.</p>
                </div>

                <div
                    onClick={() => setValue('type', 'FOLLOW_UP', { shouldValidate: true })}
                    className={cn("cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200", selectedType === 'FOLLOW_UP' ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-4 ring-emerald-600/10" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50")}
                >
                    <div className={cn("w-12 h-12 rounded-full mb-4 flex items-center justify-center", selectedType === 'FOLLOW_UP' ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500")}>
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h4 className={cn("text-lg font-bold mb-1", selectedType === 'FOLLOW_UP' ? "text-emerald-900" : "text-slate-700")}>Seguimiento</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Cuidado continuo a visitantes, nuevos creyentes o personas en proceso de integración.</p>
                </div>
            </div>
            {errors.type && <p className="text-red-500 text-sm font-medium text-center">{errors.type.message as string}</p>}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">Modalidad del Proceso</h3>
                <p className="text-slate-500 text-sm mt-1">¿Será un trayecto institucionalizado o un seguimiento fluido?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    onClick={() => {
                        if (!canSelectFormal) {
                            toast.error('No tienes permisos', { description: 'Los procesos formales requieren roles específicos.' });
                            return;
                        }
                        setValue('mode', 'FORMAL', { shouldValidate: true });
                    }}
                    className={cn("cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 text-center relative", selectedMode === 'FORMAL' ? "border-primary bg-primary/5 shadow-md ring-4 ring-primary/10" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50", !canSelectFormal && "opacity-50 grayscale cursor-not-allowed")}
                >
                    {!canSelectFormal && (
                        <div className="absolute top-3 right-3">
                            <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                    )}
                    <Building2 className={cn("w-10 h-10 mx-auto mb-3", selectedMode === 'FORMAL' ? "text-primary" : "text-slate-400")} />
                    <h4 className={cn("text-lg font-bold mb-1", selectedMode === 'FORMAL' ? "text-primary" : "text-slate-700")}>Estructurado / Formal</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Los participantes requerirán aceptación. Permite tareas, múltiples mentores y alta supervisión.</p>
                </div>

                <div
                    onClick={() => {
                        setValue('mode', 'INFORMAL', { shouldValidate: true });
                        // Limitar arreglos temporalmente si ya eligió muchos (opcional)
                    }}
                    className={cn("cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 text-center", selectedMode === 'INFORMAL' ? "border-amber-500 bg-amber-50 shadow-md ring-4 ring-amber-500/10" : "border-slate-200 hover:border-amber-300 hover:bg-slate-50")}
                >
                    <Coffee className={cn("w-10 h-10 mx-auto mb-3", selectedMode === 'INFORMAL' ? "text-amber-600" : "text-slate-400")} />
                    <h4 className={cn("text-lg font-bold mb-1", selectedMode === 'INFORMAL' ? "text-amber-800" : "text-slate-700")}>Fluido / Informal</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Un mentor y un guiado. Sin tareas ni aprobación por sistema. Ideal para charlas orgánicas.</p>
                </div>
            </div>
            {errors.mode && <p className="text-red-500 text-sm font-medium text-center">{errors.mode.message as string}</p>}
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">Configuraciones ({getTypeLabel(selectedType!)})</h3>
                <p className="text-slate-500 text-sm mt-1">Completa campos adicionales requeridos según el tipo de acompañamiento.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="space-y-4 mb-6">
                    <div>
                        <Label className="text-base font-bold text-slate-800">Motivo Principal <span className="text-red-500">*</span></Label>
                        <p className="text-sm text-slate-500 mt-1 mb-3">Breve descripción del tema o propósito a tratar. Este campo es obligatorio.</p>
                        <Input
                            placeholder="Ej: Discipulado inicial, Integración, Consejería familiar..."
                            {...register('config.mainTopic')}
                            className={(errors.config as any)?.mainTopic ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {(errors.config as any)?.mainTopic && <p className="text-red-500 text-xs mt-1 font-medium">{(errors.config as any).mainTopic.message as string}</p>}
                    </div>
                </div>

                {selectedType === 'FOLLOW_UP' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                                <Label className="text-base font-bold text-slate-800">¿En proceso de Integración?</Label>
                                <p className="text-sm text-slate-500 mt-1">Indica si la persona se está activamente integrando a la iglesia (Ej. Bautismo cercano).</p>
                            </div>
                            <Controller
                                name="config.inIntegration"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Label className="text-base font-bold text-slate-800">Notas Iniciales de Background</Label>
                            <p className="text-sm text-slate-500 mt-1 mb-3">Información sobre cuándo llegó o detalles conocidos de la visita.</p>
                            <Textarea
                                placeholder="Notas internas para el equipo..."
                                {...register('config.initialNotes')}
                                className="resize-none h-24"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep4 = () => {
        // --- Filter logic for Mentors and Mentees ---
        const availableMentors = persons.filter(p => {
            const roles = p.functionalRoles || [];
            if (selectedType === 'DISCIPLESHIP') {
                return roles.includes(FunctionalRole.DISCIPLER) || roles.includes(FunctionalRole.ADMIN_CHURCH) || roles.includes(FunctionalRole.AUDITOR);
            }
            if (selectedType === 'COUNSELING') {
                return roles.includes(FunctionalRole.COUNSELOR) || roles.includes(FunctionalRole.ADMIN_CHURCH) || roles.includes(FunctionalRole.AUDITOR);
            }
            if (selectedType === 'FOLLOW_UP') {
                return p.membershipStatus === 'MEMBER';
            }
            return true;
        });

        const availableMentees = persons.filter(p => {
            if (selectedType === 'FOLLOW_UP') {
                return p.membershipStatus !== 'MEMBER';
            }
            return true;
        });

        return (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-slate-900">Participantes del Proceso</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        {selectedType === 'FOLLOW_UP'
                            ? 'En modalidad de Seguimiento, se recomienda 1 mentor y 1 guiado.'
                            : 'En modalidad FORMAL puedes seleccionar a los involucrados, y quedarán PENDIENTES hasta que acepten (si tienen usuario).'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">

                    {/* Mentor Block */}
                    {selectedMode === 'FORMAL' && (
                        <div className="space-y-4">
                        <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">M</div>
                            Seleccionar Mentor / Guía
                        </Label>
                        <p className="text-sm text-slate-500 -mt-1">Busca y elige a la persona responsable de liderar.</p>

                        <Controller
                            name="mentors"
                            control={control}
                            render={({ field }) => {
                                const currentMentorIds = field.value?.map((v: any) => v.churchPersonId) || [];
                                return (
                                    <ParticipantCombobox
                                        values={currentMentorIds}
                                        persons={availableMentors}
                                        placeholder="Buscar mentor en el listado..."
                                        maxSelections={selectedType === 'FOLLOW_UP' ? 1 : undefined}
                                        onChange={(selectedIds) => {
                                            const formArr = selectedIds.map(id => {
                                                const p = availableMentors.find(x => x.id === id);
                                                return { churchPersonId: id, hasUserAccount: !!p?.person?.user?.id };
                                            });
                                            field.onChange(formArr);
                                        }}
                                    />
                                );
                            }}
                        />
                        {errors.mentors && <p className="text-red-500 text-xs font-medium">{errors.mentors.message as string}</p>}
                    </div>
                    )}

                    {/* Mentee Block */}
                    <div className={cn("space-y-4", selectedMode === 'FORMAL' && "pt-6 border-t border-slate-100")}>
                        <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">G</div>
                            Seleccionar Persona Guiada
                        </Label>
                        <p className="text-sm text-slate-500 -mt-1">Busca y elige a quien recibirá el acompañamiento.</p>

                        <Controller
                            name="participants"
                            control={control}
                            render={({ field }) => {
                                const currentMenteeIds = field.value?.map((v: any) => v.churchPersonId) || [];
                                return (
                                    <ParticipantCombobox
                                        values={currentMenteeIds}
                                        persons={availableMentees}
                                        placeholder="Buscar persona a acompañar..."
                                        maxSelections={selectedType === 'FOLLOW_UP' ? 1 : undefined}
                                        onChange={(selectedIds) => {
                                            const formArr = selectedIds.map(id => {
                                                const p = availableMentees.find(x => x.id === id);
                                                return { churchPersonId: id, hasUserAccount: !!p?.person?.user?.id };
                                            });
                                            field.onChange(formArr);
                                        }}
                                    />
                                );
                            }}
                        />
                        {errors.participants && <p className="text-red-500 text-xs font-medium">{errors.participants.message as string}</p>}
                    </div>

                </div>
            </div>
        );
    };

    const renderStep5 = () => {
        return (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-slate-900">Resumen y Confirmación</h3>
                    <p className="text-slate-500 text-sm mt-1">Verifica que todos los datos estén correctos antes de crear el proceso.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-1 shadow-sm overflow-hidden">
                    <div className="bg-white rounded-xl p-4 sm:p-5 space-y-4">

                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-base text-slate-900">Nuevo proceso de {getTypeLabel(selectedType!)}</h4>
                                <p className="text-xs text-slate-500">Modalidad seleccionada: <strong>{selectedMode}</strong></p>
                            </div>
                        </div>

                        {/* Participants Review */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <div className="w-3 h-3 bg-blue-200 rounded-sm"></div> Mentor(es)
                                </div>
                                <div className="mt-2 space-y-1">
                                    {selectedMode === 'FORMAL' ? (
                                        mentorsData?.length > 0 ? (
                                            mentorsData.map((m: any) => (
                                                <p key={m.churchPersonId} className="font-bold text-slate-800 text-sm">
                                                    {getSelectedPersonName(m.churchPersonId)}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="font-bold text-slate-800 text-sm">N/A</p>
                                        )
                                    ) : (
                                        <p className="font-bold text-slate-800 text-sm">Tú (Mentor(a))</p>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <div className="w-3 h-3 bg-emerald-200 rounded-sm"></div> Guiado(s)
                                </div>
                                <div className="mt-2 space-y-1">
                                    {participantsData?.length > 0 ? (
                                        participantsData.map((m: any) => (
                                            <p key={m.churchPersonId} className="font-bold text-slate-800 text-sm">
                                                {getSelectedPersonName(m.churchPersonId)}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="font-bold text-slate-800 text-sm">N/A</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Specific Configs Review */}
                        <div className="pt-4 space-y-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Configuraciones</p>

                            <div className="flex justify-between items-start text-sm py-2 border-b border-slate-100 last:border-0">
                                <span className="text-slate-600">Motivo Principal</span>
                                <span className="font-bold text-slate-900 text-right max-w-[60%]">{configData?.mainTopic}</span>
                            </div>

                            {selectedType === 'FOLLOW_UP' && (
                                <>
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-0">
                                        <span className="text-slate-600">En Integración</span>
                                        <span className="font-bold text-slate-900">{configData?.inIntegration ? 'Sí' : 'No'}</span>
                                    </div>
                                    {configData?.initialNotes && (
                                        <div className="flex justify-between items-start text-sm py-2 border-b border-slate-100 last:border-0">
                                            <span className="text-slate-600">Notas Iniciales</span>
                                            <span className="font-medium text-slate-700 text-right text-xs max-w-[60%] italic">{configData.initialNotes}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {selectedType === 'DISCIPLESHIP' && selectedMode === 'INFORMAL' && (
                                <p className="text-xs text-slate-400 italic">No hay configuraciones aplicadas. Las tareas no estarán disponibles por ser Informal.</p>
                            )}
                        </div>

                    </div>
                </div>

                {errors.root && <p className="text-red-500 text-sm font-bold text-center">{errors.root.message as string}</p>}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/30 rounded-3xl">
            {/* Headers / Stepper indicators */}
            <div className="px-4 pt-4 pb-8 md:px-8 max-w-5xl mx-auto w-full overflow-x-auto">
                <div className="flex items-center justify-between min-w-[600px] mb-6">
                    {STEPS.map((s, idx) => (
                        <div key={s.id} className="flex-1 flex items-center relative">
                            <div className="flex flex-col items-center gap-1.5 relative z-10 mx-auto">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300", step > s.id ? "bg-primary text-white" : step === s.id ? "bg-primary shrink-0 ring-[3px] ring-primary/20 text-white" : "bg-slate-200 text-slate-400")}>
                                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                                </div>
                                <div className="absolute top-10 whitespace-nowrap text-center">
                                    <span className={cn("block text-[10px] sm:text-xs font-bold uppercase tracking-wider", step >= s.id ? "text-slate-800" : "text-slate-400")}>
                                        {s.title}
                                    </span>
                                </div>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={cn("absolute right-0 top-4 w-1/2 h-[2px] transition-colors duration-500", step > s.id ? "bg-primary" : "bg-slate-200")} style={{ right: '-50%' }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 px-4 md:px-8 pb-24 max-w-5xl mx-auto w-full mt-0">
                <form id="wizard-form" onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </form>
            </div>

            {/* Sticky Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-white/80 backdrop-blur-md border-t border-slate-200 p-3 md:p-4 z-40">
                <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="font-bold border-slate-300 w-32"
                        onClick={step === 1 ? () => router.push('/mentorship') : prevStep}
                        disabled={isMutating}
                    >
                        {step === 1 ? 'Cancelar' : 'Atrás'}
                    </Button>

                    <div className="flex items-center gap-4">
                        {step < 5 ? (
                            <Button
                                type="button"
                                size="lg"
                                className="font-bold w-40 bg-slate-900 hover:bg-slate-800 text-white"
                                onClick={(e) => {
                                    e.preventDefault();
                                    nextStep();
                                }}
                            >
                                Siguiente
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                form="wizard-form"
                                size="lg"
                                className="font-bold w-48 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                disabled={isMutating}
                            >
                                {isMutating ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creando...</>
                                ) : (
                                    <><CheckCircle2 className="w-5 h-5 mr-2" /> Crear Proceso</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
