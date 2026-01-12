import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-16 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 relative z-10">
                <div className="col-span-2 space-y-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">E</span>
                        </div>
                        <span className="text-xl font-bold text-white">Ecclesia SaaS</span>
                    </div>
                    <p className="max-w-sm text-sm leading-relaxed">
                        Nuestra misión es equipar a la iglesia con tecnología de excelencia para administrar los recursos del Reino con sabiduría y eficiencia.
                    </p>
                </div>

                <div className="space-y-4">
                    <h4 className="text-white font-bold">Producto</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#funciones" className="hover:text-white transition">Funciones</Link></li>
                        <li><Link href="#precios" className="hover:text-white transition">Precios</Link></li>
                        <li><Link href="#testimonios" className="hover:text-white transition">Testimonios</Link></li>
                        <li><Link href="/login" className="hover:text-white transition">Ingresar</Link></li>
                        <li><Link href="/register" className="hover:text-white transition">Registrarse</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="text-white font-bold">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-white transition">Política de Privacidad</Link></li>
                        <li><Link href="#" className="hover:text-white transition">Términos de Servicio</Link></li>
                        <li><Link href="#" className="hover:text-white transition">Soporte</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-sm flex flex-col md:flex-row justify-between items-center">
                <p>&copy; {new Date().getFullYear()} Ecclesia SaaS. Todos los derechos reservados.</p>
                <p className="mt-2 md:mt-0 text-slate-600">Hecho con fe y código.</p>
            </div>
        </footer>
    );
}
