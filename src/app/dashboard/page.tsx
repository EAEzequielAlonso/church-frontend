'use client';

import { useAuth } from '@/context/AuthContext';

import { Users, DollarSign, Calendar } from 'lucide-react';

export default function DashboardHome() {
    const { user, churchId } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Miembros Activos"
                    value="120"
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    trend="+5% este mes"
                />
                <StatCard
                    title="Ofrendas del Mes"
                    value="$4,250"
                    icon={<DollarSign className="w-5 h-5 text-green-600" />}
                    trend="+12% vs mes anterior"
                />
                <StatCard
                    title="Próximo Evento"
                    value="Culto General"
                    subValue="Domingo 10:00 AM"
                    icon={<Calendar className="w-5 h-5 text-purple-600" />}
                    trend=""
                />
            </div>

            {/* Recent Activity or Welcome Message */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Bienvenido, {user?.fullName}</h2>
                <p className="text-gray-600">
                    Estás gestionando la iglesia con ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{churchId}</span>.
                    Desde aquí podrás administrar miembros, finanzas y más.
                </p>
            </div>
        </div>
    );
}

function StatCard({ title, value, subValue, icon, trend }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                    {subValue && <p className="text-sm text-gray-600">{subValue}</p>}
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    {icon}
                </div>
            </div>
            {trend && <p className="text-xs text-green-600 mt-4 font-medium">{trend}</p>}
        </div>
    )
}
