import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';
import ReactQueryProvider from '@/providers/ReactQueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Ecclesia SaaS',
    description: 'Gestión Integral para Iglesias',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <ReactQueryProvider>
                    <AuthProvider>
                        {children}
                        <Toaster richColors position="top-right" />
                    </AuthProvider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
