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
            <DialogContent className="sm:max-w-md border-none shadow-2xl bg-white p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/pattern.png')] bg-repeat"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <Heart className="w-6 h-6 text-white" fill="currentColor" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight mb-2">Apoyo a la Visión</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-medium max-w-xs mx-auto">
                            Tu aporte voluntario nos ayuda a mantener y mejorar Ecclesia SaaS para servir mejor a tu ministerio.
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Presets removed as requested */}

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-700">Ingresa el monto que desees aportar:</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-400 font-bold">$</span>
                            </div>
                            <Input
                                type="number"
                                placeholder="Ej: 10000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-8 h-12 bg-slate-50 border-slate-200 focus:ring-indigo-500/20 text-lg font-bold text-slate-800"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleDonate}
                        disabled={loading || !amount}
                        className="w-full h-12 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <CreditCard className="w-5 h-5 mr-2" />
                                Donar con Mercado Pago
                            </>
                        )}
                    </Button>

                    <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        Pagos seguros procesados por Mercado Pago
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
