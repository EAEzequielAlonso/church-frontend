'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SystemRole, FunctionalRole } from '@/types/auth-types';
import {
    LayoutDashboard,
    Users,
    HeartHandshake,
    Calendar,
    Wallet,
    UserPlus,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Book,
    GraduationCap,
    BookOpen,
    Package,
    Map,
    Music,
    // HelpingHand // Valid lucide icon? Or use HeartHandshake
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import { useSidebar } from '@/context/SidebarContext';

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, toggleSidebar, isMobileOpen, toggleMobileSidebar } = useSidebar();
    const { logout, user } = useAuth();

    // Helper to check roles (Now checks Functional Roles or Permissions if passed)
    const hasRole = (roles: string[]) => {
        if (!user) return false;
        // Platform Admin (Superuser)
        if (user.systemRole === SystemRole.ADMIN_APP) return true;
        // Church Admin (Functional Role)
        if (user.roles?.includes(FunctionalRole.ADMIN_CHURCH)) return true;

        // user.roles contains FunctionalRoles (strings)
        return roles.some(role => user.roles?.includes(role));
    };

    const menuGroups: { label: string; items: any[] }[] = [
        {
            label: 'Principal',
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                { name: 'Mi Agenda', href: '/agenda', icon: Calendar },
            ]
        },
        {
            label: 'Gestión',
            items: [
                { name: 'Miembros', href: '/members', icon: Users },
                { name: 'Cultos', href: '/worship', icon: Music },
                { name: 'Ministerios', href: '/ministries', icon: Users },
                { name: 'Familias', href: '/families', icon: Users },
                { name: 'Comunidad', href: '/community', icon: Users },
            ].filter((item: any) => item.show ?? true)
        },
        {
            label: 'Cuidado',
            items: [
                { name: 'Acompañamiento', href: '/counseling', icon: HeartHandshake, show: hasRole(['ADMIN_CHURCH', 'COUNSELOR', 'PASTOR']) },
                { name: 'Discipulados', href: '/discipleship', icon: GraduationCap },
                // { name: 'Seguimiento', href: '/followups', icon: UserPlus }, // Removed per user request
                { name: 'Muro de Oración', href: '/prayers', icon: HeartHandshake },
            ]
        },
        {
            label: 'Recursos',
            items: [
                { name: 'Biblioteca', href: '/library', icon: Book },
                { name: 'Inventario', href: '/inventory', icon: Package },
                {
                    name: 'Tesorería',
                    href: '/treasury',
                    icon: Wallet,
                    show: hasRole(['TREASURER', 'ADMIN_CHURCH', 'AUDITOR', 'ADMIN_APP']),
                    subItems: [
                        { name: 'Transacciones', href: '/treasury' },
                        { name: 'Cuentas', href: '/treasury/accounts' },
                        { name: 'Reportes', href: '/treasury/reports' },
                        { name: 'Presupuestos', href: '/treasury/budgets' },
                    ]
                },
            ].filter(item => item.show ?? true)
        },
        {
            label: 'Sistema',
            items: [
                { name: 'Suscripción', href: '/subscription', icon: Wallet, show: hasRole(['ADMIN_CHURCH', 'ADMIN_APP']) },
                { name: 'Configuración', href: '/settings', icon: Settings, show: hasRole(['ADMIN_CHURCH', 'ADMIN_APP']) },
            ].filter(item => item.show ?? true)
        }
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={toggleMobileSidebar}
                />
            )}

            <div className={cn(
                "flex flex-col h-screen bg-[#0f172a] border-r border-white/5 transition-all duration-500 z-50 shadow-2xl",
                "fixed inset-y-0 left-0 md:relative",
                isOpen ? "w-72" : "w-24",
                !isMobileOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0",
                "scrollbar-hide hover:scrollbar-default"
            )}>
                {/* Fixed Header with matched height to Navbar */}
                <div className="flex items-center justify-between px-4 h-20 border-b border-white/5 bg-[#0f172a]">
                    <div className={cn("flex items-center gap-3 transition-all duration-300", (!isOpen && !isMobileOpen) && "scale-0 w-0")}>
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-all duration-500">
                            <span className="font-black text-xl tracking-tighter text-white">E</span>
                        </div>
                        <h1 className="font-black text-xl text-white tracking-tighter">
                            Ecclesia<span className="text-white/80 italic">SaaS</span>
                        </h1>
                    </div>
                    <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary transition-all hidden md:block border border-transparent hover:border-slate-200">
                        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <button onClick={toggleMobileSidebar} className="p-1.5 rounded-lg hover:bg-slate-100 md:hidden">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
                    {menuGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="mb-6">
                            {(isOpen || isMobileOpen) && (
                                <p className="px-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                    {group.label}
                                </p>
                            )}
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center py-3 px-4 rounded-2xl transition-all duration-300 group relative mb-2 mx-2",
                                            isActive
                                                ? "bg-white/10 text-white shadow-xl translate-x-1"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5 shrink-0", (isOpen || isMobileOpen) ? "mr-4" : "mx-auto", isActive ? "text-[#fbbf24]" : "text-slate-400")} />
                                        <span className={cn(
                                            "transition-all duration-300 whitespace-nowrap text-sm font-bold tracking-tight",
                                            (!isOpen && !isMobileOpen) && "opacity-0 w-0 hidden"
                                        )}>
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 bg-[#0f172a]">
                    <button
                        onClick={() => logout()}
                        className={cn(
                            "flex items-center w-full p-3 text-slate-400 hover:text-[#fbbf24] rounded-2xl hover:bg-white/5 transition-all font-black text-sm group",
                            (!isOpen && !isMobileOpen) && "justify-center"
                        )}
                    >
                        <LogOut className={cn("w-5 h-5 shrink-0 transition-transform group-hover:rotate-12", (isOpen || isMobileOpen) && "mr-3")} />
                        <span className={cn("transition-all duration-300 whitespace-nowrap uppercase tracking-widest", (!isOpen && !isMobileOpen) && "hidden")}>
                            Salir
                        </span>
                    </button>
                    {isOpen && (
                        <p className="text-[9px] text-center text-slate-500 mt-3 font-black uppercase tracking-widest opacity-50">Ecclesia Platform v2.0</p>
                    )}
                </div>
            </div>
        </>
    );
}
