'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, CreditCard, Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';

interface VisionSupportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function VisionSupportDialog({ open, onOpenChange }: VisionSupportDialogProps) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Quick donation amounts
    const presets = [5000, 10000, 20000];

    const handleDonate = async () => {
        const value = Number(amount);
        if (!value || value <= 0) {
            toast.error('Por favor ingresa un monto válido');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            console.log('Initiating donation preference for amount:', value);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/donations/preference`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: value })
            });

            const data = await res.json();
            console.log('Donation preference response:', data);

            if (res.ok && data.init_point) {
                toast.loading('Redirigiendo a Mercado Pago...');
                window.location.href = data.init_point;
            } else {
                console.error('Donation error:', data);
                toast.error(data.message || 'Error al iniciar la donación');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Hubo un problema de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-none shadow-2xl bg-[#0f1014] p-0 overflow-hidden rounded-3xl">
                <div className="bg-gradient-to-br from-[#7f1d1d] to-[#450a0a] p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/pattern.png')] bg-repeat"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-14 h-14 bg-[#fbbf24]/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-5 shadow-2xl border border-[#fbbf24]/30">
                            <Heart className="w-7 h-7 text-[#fbbf24]" fill="currentColor" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight mb-2 text-white">Apoyo a la Visión</DialogTitle>
                        <DialogDescription className="text-white/80 font-medium max-w-sm mx-auto leading-relaxed">
                            Tu aporte voluntario nos ayuda a mantener y mejorar Ecclesia SaaS para servir mejor a la iglesia del Señor.
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-8 space-y-8 bg-zinc-950">
                    {/* Presets removed as requested */}

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Ingresa el monto que desees aportar</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-[#fbbf24] font-bold text-lg">$</span>
                            </div>
                            <Input
                                type="number"
                                placeholder="Ej: 10000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-10 h-14 bg-zinc-900/50 border-zinc-800 focus:ring-[#fbbf24]/20 focus:border-[#fbbf24]/50 text-xl font-black text-white placeholder:text-zinc-600 rounded-2xl transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleDonate}
                        disabled={loading || !amount}
                        className="w-full h-14 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#fbbf24] text-black font-black text-lg rounded-2xl shadow-xl shadow-[#fbbf24]/10 transition-all active:scale-[0.98] border border-[#fbbf24]/50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                <CreditCard className="w-6 h-6 mr-3" />
                                Donar con Mercado Pago
                            </>
                        )}
                    </Button>

                    <p className="text-center text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-6">
                        Pagos seguros procesados por Mercado Pago
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
