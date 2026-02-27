import { useState } from 'react';
import { useBooks, useCategories, useLibraryMutations } from '../hooks/useLibrary';
import { BookStatus, BookOwnershipType, Book } from '../types/library.types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, BookOpen, AlertCircle, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { BookDialog } from './BookDialog';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function BookCatalog() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('all');
    const [availability, setAvailability] = useState<string>('all');
    const [page, setPage] = useState(1);

    // Reset page when filters change
    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setPage(1);
    };

    const { data: categories } = useCategories();

    const { data: paginatedBooks, isLoading } = useBooks({
        search,
        categoryId: category === 'all' ? undefined : category,
        availability: availability === 'all' ? undefined : (availability as 'AVAILABLE' | 'UNAVAILABLE'),
        page,
        limit: 10
    });

    const books = paginatedBooks?.data || [];
    const meta = paginatedBooks?.meta;

    const { requestLoan, deleteBook } = useLibraryMutations();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [bookToEdit, setBookToEdit] = useState<Book | undefined>(undefined);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

    const handleRequestLoan = (bookId: string) => {
        toast.promise(requestLoan.mutateAsync({ bookId }), {
            loading: 'Solicitando préstamo...',
            success: 'Solicitud enviada correctamente',
            error: (err) => `Error al solicitar: ${err.message}`
        });
    };

    const canManageBook = (book: Book) => {
        if (!user) return false;
        // Librarian or Pastor can manage all
        if (user.roles?.includes('LIBRARIAN') || user.ecclesiasticalRole === 'PASTOR') return true;
        // Owner checks
        if (book.ownershipType === BookOwnershipType.MEMBER && book.ownerMemberId === user.memberId) return true;
        return false;
    };

    const handleEdit = (book: Book) => {
        setBookToEdit(book);
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!bookToDelete) return;
        try {
            await deleteBook.mutateAsync(bookToDelete.id);
            toast.success('Libro eliminado');
            setBookToDelete(null);
        } catch (error) {
            toast.error('Error al eliminar libro');
        }
    };

    const handleCloseDialog = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setBookToEdit(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar título, autor..."
                            value={search}
                            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={category} onValueChange={(val) => handleFilterChange(setCategory, val)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categories?.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={availability} onValueChange={(val) => handleFilterChange(setAvailability, val)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Disponibilidad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="AVAILABLE">Disponibles</SelectItem>
                            <SelectItem value="UNAVAILABLE">Prestados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={() => { setBookToEdit(undefined); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Libro
                </Button>
            </div>

            {isLoading ? (
                <div>Cargando libros...</div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {books.map(book => (
                            <Card key={book.id} className="flex flex-col justify-between overflow-hidden group hover:shadow-lg transition-shadow duration-300 relative">
                                {canManageBook(book) && (
                                    <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => handleEdit(book)}>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => setBookToDelete(book)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                <div className="aspect-[2/3] w-full relative bg-muted flex items-center justify-center overflow-hidden">
                                    {book.coverUrl ? (
                                        <img
                                            src={book.coverUrl}
                                            alt={book.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
                                            <BookOpen className="h-8 w-8 mb-2 opacity-20" />
                                            <span className="text-[10px]">Sin portada</span>
                                        </div>
                                    )}
                                    <Badge
                                        className={`absolute top-2 right-2 shadow-sm text-[10px] px-1.5 py-0.5 ${book.status === BookStatus.AVAILABLE
                                            ? 'bg-green-600 hover:bg-green-700 border-transparent text-white'
                                            : 'bg-red-600 hover:bg-red-700 border-transparent text-white'
                                            }`}
                                    >
                                        {book.status === BookStatus.AVAILABLE ? 'Disponible' : 'Prestado'}
                                    </Badge>
                                </div>
                                <CardHeader className="p-3 pb-1">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 mb-1 truncate max-w-[100%]">{book.category?.name || 'Varios'}</Badge>
                                    </div>
                                    <CardTitle className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5em]" title={book.title}>
                                        {book.title}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                                </CardHeader>
                                <CardContent className="flex-grow p-3 pt-0">
                                    <div className="mt-2 flex items-center text-[10px] text-muted-foreground gap-1.5">
                                        <BookOpen className="h-3 w-3" />
                                        <span className="truncate">{book.isChurchOwned ? 'Iglesia' : `${book.ownerMember?.person?.firstName || 'Miembro'}`}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full h-8 text-xs"
                                        disabled={book.status !== BookStatus.AVAILABLE}
                                        onClick={() => handleRequestLoan(book.id)}
                                    >
                                        {book.status === BookStatus.AVAILABLE ? 'Solicitar' : 'No Disponible'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                        {books.length === 0 && (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No se encontraron libros.
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {meta && meta.lastPage > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Página {page} de {meta.lastPage}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                                disabled={page === meta.lastPage}
                            >
                                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            <BookDialog
                open={isDialogOpen}
                onOpenChange={handleCloseDialog}
                categories={categories || []}
                bookToEdit={bookToEdit}
            />

            <AlertDialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el libro "{bookToDelete?.title}". Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
