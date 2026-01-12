'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function Testimonials() {
    const testimonials = [
        {
            quote: "Ecclesia ha transformado cómo gestionamos el seguimiento de nuevos creyentes. Nadie se queda atrás ahora.",
            author: "Pastor Carlos M.",
            role: "Iglesia Vida Nueva",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
        },
        {
            quote: "La transparencia en finanzas que logramos con este sistema trajo mucha paz a nuestro equipo de liderazgo.",
            author: "Tesorera Ana G.",
            role: "Comunidad de Fe",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
        },
        {
            quote: "Simple de usar incluso para nuestros voluntarios mayores. Es una bendición para nuestra administración.",
            author: "Diácono Roberto L.",
            role: "Centro Cristiano Central",
            image: "https://i.pravatar.cc/150?u=a04258114e29026302d"
        }
    ];

    return (
        <section id="testimonios" className="py-24 px-6 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-accent font-bold uppercase tracking-widest text-sm">Testimonios</h2>
                    <h3 className="text-4xl font-bold text-slate-900">Lo que dicen los Pastores</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
                        >
                            <Quote className="w-10 h-10 text-primary/20 mb-6" />
                            <p className="text-slate-700 italic text-lg mb-6 flex-grow">"{item.quote}"</p>
                            <div className="flex items-center space-x-4">
                                <img src={item.image} alt={item.author} className="w-12 h-12 rounded-full border-2 border-primary/20" />
                                <div>
                                    <h5 className="font-bold text-slate-900">{item.author}</h5>
                                    <span className="text-sm text-slate-500">{item.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
