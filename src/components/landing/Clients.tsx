export default function Clients() {
    // Array of placeholder church names/logos. 
    // In a real app, these would be SVG images.
    const clients = [
        "Iglesia Del Centro", "Comunidad Vida", "Ministerio Roca Fuerte", "Catedral de Fe", "Iglesia Renacer"
    ];

    return (
        <section className="py-10 bg-slate-50 border-y border-slate-200/60 w-full overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Más de 500 iglesias confían en Ecclesia</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale transition-all duration-500 hover:opacity-80 hover:grayscale-0">
                    {/* Placeholder Text Logos for now */}
                    {clients.map((client, index) => (
                        <div key={index} className="flex items-center">
                            <span className="text-xl md:text-2xl font-black text-slate-800">{client}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
