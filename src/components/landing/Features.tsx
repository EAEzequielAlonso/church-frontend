import { Users, Coins, HeartHandshake, Calendar, ShieldCheck, BarChart3 } from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: <Users className="w-8 h-8" />,
            title: "Membresía Dinámica",
            description: "Base de datos viva de tu congregación. Seguimiento de crecimiento espiritual, discipulado y bautismos.",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            icon: <Coins className="w-8 h-8" />,
            title: "Tesorería Transparente",
            description: "Control preciso de diezmos y ofrendas. Reportes automáticos para la transparencia financiera.",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            icon: <HeartHandshake className="w-8 h-8" />,
            title: "Consejería Pastoral",
            description: "Espacio seguro para registrar sesiones pastorales y seguimiento personal bajo estricta confidencialidad.",
            color: "text-red-600",
            bg: "bg-red-50"
        },
        {
            icon: <Calendar className="w-8 h-8" />,
            title: "Agenda Ministerial",
            description: "Organiza eventos, cultos y predicaciones. Gestiona el uso de instalaciones y voluntarios.",
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Seguridad Total",
            description: "Tus datos están protegidos con encriptación de nivel bancario. Acceso basado en roles.",
            color: "text-slate-600",
            bg: "bg-slate-50"
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Reportes Inteligentes",
            description: "Toma decisiones basadas en datos reales sobre asistencia, crecimiento y finanzas.",
            color: "text-accent",
            bg: "bg-yellow-50"
        }
    ];

    return (
        <section id="funciones" className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-accent font-bold uppercase tracking-widest text-sm">Todo en un solo lugar</h2>
                    <h3 className="text-4xl font-bold text-slate-900">Potentes herramientas para el Ministerio</h3>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Deja de luchar con hojas de cálculo dispersas. Ecclesia SaaS unifica toda la administración
                        de tu iglesia en una plataforma intuitiva.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group p-8 rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                            <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
