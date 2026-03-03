'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCatalog } from './components/BookCatalog';
import { LoanManagement } from './components/LoanManagement';
import { MyLoans } from './components/MyLoans';
import { LoanHistory } from './components/LoanHistory';
import { BookOpen, Library as LibraryIcon, History, ScrollText } from 'lucide-react';

export default function LibraryPage() {
    return (
        <div className="container mx-auto py-6 space-y-4">
            <Tabs defaultValue="catalog" className="space-y-4">
                {/* Header row: title on left, tabs on right */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
                        <p className="text-muted-foreground text-sm mt-1">Gestión de libros y préstamos de la iglesia.</p>
                    </div>
                    <TabsList className="shrink-0">
                        <TabsTrigger value="catalog" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" /> Catálogo
                        </TabsTrigger>
                        <TabsTrigger value="my-loans" className="flex items-center gap-2">
                            <History className="h-4 w-4" /> Mis Solicitudes
                        </TabsTrigger>
                        <TabsTrigger value="historial" className="flex items-center gap-2">
                            <ScrollText className="h-4 w-4" /> Historial
                        </TabsTrigger>
                        <TabsTrigger value="management" className="flex items-center gap-2">
                            <LibraryIcon className="h-4 w-4" /> Gestión
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="catalog" className="space-y-4">
                    <BookCatalog />
                </TabsContent>

                <TabsContent value="my-loans" className="space-y-4">
                    <MyLoans />
                </TabsContent>

                <TabsContent value="historial" className="space-y-4">
                    <LoanHistory />
                </TabsContent>

                <TabsContent value="management" className="space-y-4">
                    <LoanManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}

