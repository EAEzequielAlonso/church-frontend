'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navClasses = cn(
        'fixed top-0 w-full z-50 transition-all duration-300 border-b',
        scrolled
            ? 'bg-white/90 backdrop-blur-md border-slate-200 py-3 shadow-sm'
            : 'bg-transparent border-transparent py-5'
    );

    return (
        <header className={navClasses}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-xl">E</span>
                    </div>
                    <span className={cn("text-2xl font-bold tracking-tight transition-colors", scrolled ? "text-slate-900" : "text-slate-900")}>
                        Ecclesia<span className="text-primary italic">SaaS</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link href="#funciones" className="text-sm font-medium text-slate-600 hover:text-primary transition">Funciones</Link>
                    <Link href="#precios" className="text-sm font-medium text-slate-600 hover:text-primary transition">Precios</Link>
                    <Link href="#testimonios" className="text-sm font-medium text-slate-600 hover:text-primary transition">Testimonios</Link>
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-primary transition">
                        Iniciar Sesión
                    </Link>
                    <Link
                        href="/register"
                        className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition shadow-lg shadow-primary/30 active:scale-95 hover:bg-red-900"
                    >
                        Prueba Gratis
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
                    >
                        <nav className="flex flex-col p-6 space-y-4">
                            <Link href="#funciones" className="text-lg font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>Funciones</Link>
                            <Link href="#precios" className="text-lg font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>Precios</Link>
                            <Link href="#testimonios" className="text-lg font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>Testimonios</Link>
                            <hr className="border-slate-100" />
                            <Link href="/login" className="text-lg font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>Iniciar Sesión</Link>
                            <Link
                                href="/register"
                                className="bg-primary text-white text-center py-3 rounded-xl font-bold shadow-lg shadow-primary/20"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Comenzar Prueba Gratis
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
