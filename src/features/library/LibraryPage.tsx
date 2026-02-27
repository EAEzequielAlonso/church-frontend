import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCatalog } from './components/BookCatalog';
import { LoanManagement } from './components/LoanManagement';
import { MyLoans } from './components/MyLoans';
import { BookOpen, Library as LibraryIcon, History } from 'lucide-react';

export default function LibraryPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
                <p className="text-muted-foreground">Gestión de libros y préstamos de la iglesia.</p>
            </div>

            <Tabs defaultValue="catalog" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="catalog" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Catálogo
                    </TabsTrigger>
                    <TabsTrigger value="my-loans" className="flex items-center gap-2">
                        <History className="h-4 w-4" /> Mis Préstamos
                    </TabsTrigger>
                    <TabsTrigger value="management" className="flex items-center gap-2">
                        <LibraryIcon className="h-4 w-4" /> Gestión (Bibliotecario)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="catalog" className="space-y-4">
                    <BookCatalog />
                </TabsContent>

                <TabsContent value="my-loans" className="space-y-4">
                    <MyLoans />
                </TabsContent>

                <TabsContent value="management" className="space-y-4">
                    <LoanManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
