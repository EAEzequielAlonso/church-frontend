import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Pricing() {
    return (
        <section id="precios" className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-accent font-bold uppercase tracking-widest text-sm">Inversión para el Reino</h2>
                    <h3 className="text-4xl font-bold text-slate-900">Planes Simples y Transparentes</h3>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Comienza gratis y elige el plan que mejor se adapte al tamaño de tu congregación. Sin contratos forzosos.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* Free Trial */}
                    <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50 relative">
                        <h4 className="text-2xl font-bold text-slate-900 mb-2">Prueba Gratuita</h4>
                        <p className="text-slate-500 mb-6">Para explorar sin compromiso</p>
                        <div className="mb-8">
                            <span className="text-4xl font-bold text-slate-900">$0</span>
                            <span className="text-slate-500"> / 14 días</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <FeatureItem text="Acceso a todas las funciones" />
                            <FeatureItem text="Hasta 50 miembros" />
                            <FeatureItem text="Soporte por email" />
                        </ul>
                        <Link href="/register?plan=trial" className="w-full block text-center bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 transition">
                            Comenzar Gratis
                        </Link>
                    </div>

                    {/* Basic Plan */}
                    <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-lg relative">
                        <h4 className="text-2xl font-bold text-slate-900 mb-2">Plan Crecimiento</h4>
                        <p className="text-slate-500 mb-6">Para iglesias en desarrollo</p>
                        <div className="mb-8">
                            <span className="text-4xl font-bold text-slate-900">$30</span>
                            <span className="text-slate-500"> / mes</span>
                            <p className="text-xs text-slate-400 mt-1">Aprox. $45,000 ARS</p>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <FeatureItem text="Miembros ilimitados" />
                            <FeatureItem text="Gestión de Tesorería Básica" />
                            <FeatureItem text="3 Usuarios Administradores" />
                            <FeatureItem text="Soporte Prioritario" />
                        </ul>
                        <Link href="/register?plan=basic" className="w-full block text-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
                            Elegir Plan
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-8 rounded-3xl border-2 border-primary bg-white shadow-2xl relative transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                            MÁS POPULAR
                        </div>
                        <h4 className="text-2xl font-bold text-primary mb-2">Plan Liderazgo</h4>
                        <p className="text-slate-500 mb-6">Gestión total sin límites</p>
                        <div className="mb-8">
                            <span className="text-4xl font-bold text-slate-900">$60</span>
                            <span className="text-slate-500"> / mes</span>
                            <p className="text-xs text-slate-400 mt-1">Aprox. $90,000 ARS</p>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <FeatureItem text="Todo lo del Plan Crecimiento" />
                            <FeatureItem text="Módulo de Consejería Avanzado" />
                            <FeatureItem text="Usuarios Administradores Ilimitados" />
                            <FeatureItem text="Reportes Financieros Avanzados" />
                            <FeatureItem text="Gestión de Grupos Pequeños" />
                            <FeatureItem text="Soporte VIP 24/7" />
                        </ul>
                        <Link href="/register?plan=pro" className="w-full flex items-center justify-center bg-primary text-white font-bold py-4 rounded-xl hover:bg-red-900 transition shadow-lg shadow-primary/30">
                            Obtener Acceso Total <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-center text-slate-700 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            {text}
        </li>
    );
}
