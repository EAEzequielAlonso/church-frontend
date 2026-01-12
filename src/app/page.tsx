import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Clients from '@/components/landing/Clients';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />
            <Hero />
            <Clients />
            <Features />
            <Testimonials />
            <Pricing />
            <Footer />
        </main>
    );
}
