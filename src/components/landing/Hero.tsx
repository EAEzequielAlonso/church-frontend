'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center justify-center">
            {/* Background Light Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto text-center space-y-8 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center space-x-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm mb-4 hover:border-accent/50 transition-colors cursor-default"
                >
                    <span className="flex h-2 w-2 rounded-full bg-accent animate-ping absolute inline-flex opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-2">La herramienta N°1 para Iglesias en 2026</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]"
                >
                    Gestión Ministerial que<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-900">Transforma Generaciones</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
                >
                    Ecclesia SaaS centraliza miembros, finanzas y planificación en una plataforma simple, segura y diseñada para el crecimiento del Reino.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-8"
                >
                    <Link href="/register" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-900 transition shadow-xl shadow-primary/25 flex items-center justify-center group">
                        Prueba Gratis 14 Días
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                    </Link>
                    <Link href="#precios" className="w-full sm:w-auto bg-white text-slate-700 px-8 py-4 rounded-full font-bold text-lg border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center hover:shadow-lg">
                        Ver Planes
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="pt-8 flex items-center justify-center space-x-6 text-sm font-medium text-slate-500"
                >
                    <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Sin tarjeta de crédito</div>
                    <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Cancelación en cualquier momento</div>
                </motion.div>
            </div>
        </section>
    );
}
