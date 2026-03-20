'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Users, HeartHandshake, UserPlus, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
    members: {
        total: number;
        visitors: number;
        invited: number;
        prospects: number;
        members: number;
    };
    groups: {
        total: number;
        active: number;
    };
}

export default function DashboardPage() {
    const { churchId } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [upcomingServices, setUpcomingServices] = useState<any[]>([]);
    const [mentorships, setMentorships] = useState<any[]>([]);

    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        if (!churchId) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [statsRes, subRes, upcomingRes, mentorshipsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/dashboard/stats?churchId=${churchId}`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/subscriptions/current`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/dashboard/upcoming?churchId=${churchId}`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/dashboard/mentorships?churchId=${churchId}`, { headers })
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (subRes.ok) setSubscription(await subRes.json());
                if (upcomingRes.ok) setUpcomingServices(await upcomingRes.json());
                if (mentorshipsRes.ok) setMentorships(await mentorshipsRes.json());
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [churchId]);

    if (loading && !stats) {
        return <div className="p-6">Cargando estadísticas...</div>;
    }

    if (!churchId) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold">No has seleccionado ninguna iglesia</h2>
                <p className="text-gray-500 mt-2">Crea una nueva iglesia o solicita unirte a una existente.</p>
            </div>
        );
    }

    // Trial calculation
    const isTrial = subscription?.status === 'TRIAL';
    const trialDaysLeft = isTrial && subscription?.plan?.name === 'TRIAL'
        ? Math.ceil((new Date(subscription.trialEndsAt || 0).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-0">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black tracking-tight text-gray-900">Dashboard</h1>
            </div>

            {isTrial && trialDaysLeft <= 14 && (
                <div className={`p-4 rounded-xl border ${trialDaysLeft <= 3 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'} mb-6 `}>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-bold">¡Estás en el periodo de prueba!</span>
                            <span className="ml-2">Te quedan {Math.max(0, trialDaysLeft)} días para disfrutar de todas las funciones PRO.</span>
                        </div>
                        <a href="/subscription" className="px-4 py-2 bg-white rounded shadow-sm text-sm font-semibold hover:bg-gray-50 transition-colors">
                            Ver Planes
                        </a>
                    </div>
                </div>
            )}

            {/* STATS WIDGETS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-indigo-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Membresía Activa</h3>
                    <p className="text-4xl font-black mt-2 text-indigo-950">{stats?.members.members || 0}</p>
                    <span className="text-xs text-indigo-600 font-bold flex items-center mt-2 bg-indigo-50 w-max px-2 py-1 rounded-full">{stats?.members.total} Registrados totales</span>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-indigo-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-16 h-16 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Candidatos</h3>
                    <p className="text-4xl font-black mt-2 text-indigo-950">{stats?.members.prospects || 0}</p>
                    <span className="text-xs text-emerald-600 font-bold flex items-center mt-2 bg-emerald-50 w-max px-2 py-1 rounded-full">En proceso de membresía</span>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-indigo-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserPlus className="w-16 h-16 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Visitantes</h3>
                    <p className="text-4xl font-black mt-2 text-indigo-950">{stats?.members.visitors || 0}</p>
                    <span className="text-xs text-blue-600 font-bold flex items-center mt-2 bg-blue-50 w-max px-2 py-1 rounded-full">Requieren seguimiento</span>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-indigo-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <HeartHandshake className="w-16 h-16 text-amber-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nuevos Invitados</h3>
                    <p className="text-4xl font-black mt-2 text-indigo-950">{stats?.members.invited || 0}</p>
                    <span className="text-xs text-amber-600 font-bold flex items-center mt-2 bg-amber-50 w-max px-2 py-1 rounded-full">Contactos recientes</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* UPCOMING EVENTS */}
                <div className="col-span-1 lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-900 border-b-2 border-indigo-500 pb-1">Mi Agenda</h3>
                    </div>

                    <div className="space-y-4 flex-1">
                        {upcomingServices.length > 0 ? (
                            upcomingServices.map((event: any) => {
                                let badgeColor = 'bg-slate-50 text-slate-700';
                                let iconColor = 'bg-slate-50 text-slate-700';
                                let eventLabel = 'Evento';

                                switch (event.type) {
                                    case 'WORSHIP':
                                        badgeColor = 'text-indigo-600 bg-indigo-50';
                                        iconColor = 'bg-indigo-50 text-indigo-700';
                                        eventLabel = 'Culto General';
                                        break;
                                    case 'MINISTRY':
                                        badgeColor = 'text-blue-600 bg-blue-50';
                                        iconColor = 'bg-blue-50 text-blue-700';
                                        eventLabel = 'Ministerio';
                                        break;
                                    case 'SMALL_GROUP':
                                        badgeColor = 'text-emerald-600 bg-emerald-50';
                                        iconColor = 'bg-emerald-50 text-emerald-700';
                                        eventLabel = 'Grupo Pequeño';
                                        break;
                                    case 'COURSE':
                                        badgeColor = 'text-violet-600 bg-violet-50';
                                        iconColor = 'bg-violet-50 text-violet-700';
                                        eventLabel = 'Curso';
                                        break;
                                }

                                return (
                                    <div
                                        key={event.id}
                                        className="flex items-center gap-4 p-4 hover:shadow-md bg-slate-50/50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-indigo-100 group"
                                        onClick={() => router.push(event.link || '/calendar')}
                                    >
                                        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${iconColor} border border-white shadow-sm`}>
                                            <span className="text-xl leading-none">{format(new Date(event.date), 'dd')}</span>
                                            <span className="text-[10px] uppercase leading-none mt-1">{format(new Date(event.date), 'MMM', { locale: es })}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className={`text-[9px] uppercase tracking-wider font-black px-1.5 h-4 border-none ${badgeColor}`}>{eventLabel}</Badge>
                                            </div>
                                            <p className="font-bold text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">{event.title}</p>
                                            <div className="flex items-center gap-3 mt-1.5 text-[11px] font-medium text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {format(new Date(event.date), 'HH:mm')} hs
                                                </span>
                                                {event.location && (
                                                    <span className="flex items-center gap-1 text-slate-400 truncate">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                        {event.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400 text-sm">
                                <Calendar className="w-10 h-10 mb-3 text-slate-200" />
                                <p className="font-semibold text-slate-500">Agenda libre</p>
                                <p className="text-xs mt-1">No tienes eventos próximos programados.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ACTIVE MENTORSHIPS */}
                <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-900 border-b-2 border-emerald-500 pb-1">Mis Mentorías Activas</h3>
                        <Badge variant="secondary" className="font-black bg-emerald-50 text-emerald-700 hover:bg-emerald-100">{mentorships.length} PROCESOS</Badge>
                    </div>

                    {mentorships.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {mentorships.map((process: any) => (
                                <div key={process.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group cursor-pointer" onClick={() => router.push(`/mentorship/${process.id}`)}>
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="outline" className={`text-[10px] uppercase font-black tracking-widest border-none ${
                                            process.type === 'DISCIPLESHIP' ? 'bg-indigo-50 text-indigo-700' : 
                                            process.type === 'COUNSELING' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                        }`}>
                                            {process.type === 'DISCIPLESHIP' ? 'Discipulado' : 
                                             process.type === 'COUNSELING' ? 'Consejería' : 'Seguimiento'}
                                        </Badge>
                                        <Badge variant="secondary" className="text-[9px] uppercase tracking-wider bg-slate-100 text-slate-500">
                                            {process.mode === 'FORMAL' ? 'Formal' : 'Informal'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 mb-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {process.myRole === 'MENTOR' ? 'Mentoreando a' : 'Tu Mentor'}
                                        </p>
                                        <p className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                                            {process.counterPartName}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <div className="text-xs font-medium text-slate-500">
                                            <span className="text-slate-400 mr-1">Desde:</span>
                                            {format(new Date(process.startDate), 'd MMM yyyy', { locale: es })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400 text-sm">
                            <HeartHandshake className="w-12 h-12 mb-4 text-slate-200" />
                            <p className="font-semibold text-slate-500 text-base">Sin procesos activos</p>
                            <p className="text-xs mt-1">Actualmente no estás participando en ninguna mentoría o seguimiento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

