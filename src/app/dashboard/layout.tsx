'use client';

import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, User, Home, Users, Wallet, HeartHandshake, Calendar } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, churchId } = useAuth();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { icon: <Home />, label: 'Inicio', href: '/dashboard' },
        { icon: <Users />, label: 'Miembros', href: '/dashboard/members' },
        { icon: <Wallet />, label: 'Tesorería', href: '/dashboard/treasury' },
        { icon: <HeartHandshake />, label: 'Consejería', href: '/dashboard/counseling' },
        { icon: <Calendar />, label: 'Cronogramas', href: '/dashboard/schedules' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:relative md:translate-x-0 flex flex-col`}
            >
                <div className="p-6 border-b border-red-900/30 font-bold text-xl flex items-center gap-2">
                    <span>Ecclesia SaaS</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${isActive
                                        ? 'bg-red-900/50 text-white'
                                        : 'text-red-100 hover:bg-red-900/30 hover:text-white'
                                    }`}
                            >
                                <div className="w-5 h-5">{item.icon}</div>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-red-900/30">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-100 hover:bg-red-900/30 hover:text-white transition text-sm font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
                    <button
                        className="md:hidden text-gray-600 focus:outline-none"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'Usuario'}</p>
                            <p className="text-xs text-gray-500">Iglesia ID: {churchId || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-200 p-2 rounded-full">
                            <User className="w-5 h-5 text-gray-600" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
