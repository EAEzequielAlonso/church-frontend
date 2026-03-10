import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Ministry } from '@/types/ministry';

interface MinistryCardProps {
    ministry: Ministry;
}

export function MinistryCard({ ministry }: MinistryCardProps) {
    const router = useRouter();

    return (
        <Card
            className="group relative overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white ring-1 ring-slate-200/50"
            onClick={() => router.push(`/ministries/${ministry.id}`)}
        >
            {/* Status bar */}
            <div
                className="absolute top-0 left-0 w-full h-1.5 transition-all group-hover:h-2"
                style={{ backgroundColor: ministry.color || '#3b82f6' }}
            ></div>

            <CardHeader className="pt-8 pb-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-bold text-slate-800">{ministry.name}</CardTitle>
                            <Badge variant={ministry.status === 'active' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 font-bold uppercase tracking-tighter">
                                {ministry.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>
                        <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                            {ministry.description || 'Sin descripción disponible.'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-0">
                {/* Leader Info */}
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100/50">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-200/60 overflow-hidden shrink-0">
                        {ministry.leader?.person.avatarUrl ? (
                            <img src={ministry.leader.person.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                        )}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Líder</p>
                        <p className="text-sm font-bold text-slate-700 truncate">
                            {ministry.leader ? `${ministry.leader.person.firstName} ${ministry.leader.person.lastName}` : 'No asignado'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-900">{ministry.members?.length || 0}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Integrantes</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-900">{ministry.tasks?.length || 0}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Misiones</span>
                        </div>
                    </div>

                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
