import { useState, useEffect } from 'react';
import { Bell, Search, User, Menu, Heart } from 'lucide-react'; // Added Heart
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { VisionSupportDialog } from './VisionSupportDialog'; // Import
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import { EcclesiasticalRole } from '@/types/auth-types';
import { ROLE_UI_METADATA } from '@/constants/role-ui';

export function Header() {
    const { user } = useAuth();
    const { toggleMobileSidebar } = useSidebar();
    const [showDonation, setShowDonation] = useState(false);

    // ... (rest of the component)

    // Role display logic
    const getRoleLabel = () => {
        if (!user?.ecclesiasticalRole || user.ecclesiasticalRole === EcclesiasticalRole.NONE) {
            return 'Miembro';
        }
        return ROLE_UI_METADATA[user.ecclesiasticalRole as EcclesiasticalRole]?.label || 'Miembro';
    };

    return (
        <header className="flex items-center justify-between h-20 px-8 bg-[#7f1d1d] border-b border-white/10 sticky top-0 z-40 shadow-lg">
            {/* ... search and menu ... */}
            <div className="flex items-center gap-6 w-full max-w-xl">
                <button
                    onClick={toggleMobileSidebar}
                    className="p-3 -ml-2 rounded-2xl hover:bg-white/10 md:hidden text-[#fbbf24] active:scale-95 transition-all"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="relative flex-1 group">
                    <Search className="absolute w-5 h-5 text-[#fbbf24]/70 left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#fbbf24] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar en el reino..."
                        className="w-full pl-12 pr-4 py-3.5 text-sm bg-black/20 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/20 focus:border-[#fbbf24]/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                {/* Vision Support Button */}
                <Button
                    variant="ghost"
                    onClick={() => setShowDonation(true)}
                    className="hidden md:flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl h-11 px-4 transition-all"
                >
                    <div className="bg-[#fbbf24]/20 p-1.5 rounded-lg">
                        <Heart className="w-4 h-4 text-[#fbbf24]" fill="currentColor" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">Apoyar Visión</span>
                </Button>

                <div className="flex items-center space-x-5 pl-6 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-black text-white tracking-tight leading-none mb-1">{user?.fullName || 'Siervo de Dios'}</p>
                        <p className="text-[11px] text-[#fbbf24] font-black uppercase tracking-[0.1em]">{getRoleLabel()}</p>
                    </div>
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profile" className="w-12 h-12 rounded-2xl object-cover border-2 border-[#fbbf24]/30 shadow-2xl" />
                    ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center text-[#fbbf24] shadow-2xl group-hover:scale-105 transition-transform">
                            <User className="w-6 h-6" />
                        </div>
                    )}
                </div>
            </div>

            <VisionSupportDialog open={showDonation} onOpenChange={setShowDonation} />
        </header>
    );
}
