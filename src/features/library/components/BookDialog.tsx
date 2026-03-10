'use client';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibraryMutations } from '../hooks/useLibrary';
import { BookCategory } from '../types/library.types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface BookDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: BookCategory[];
    bookToEdit?: any;
}

interface BookFormValues {
    title: string;
    author: string;
    categoryId: string;
    description: string;
    isbn: string;
    coverUrl: string;
    ownershipType: 'CHURCH' | 'MEMBER';
}

export function BookDialog({ open, onOpenChange, categories, bookToEdit }: BookDialogProps) {
    const { user } = useAuth();
    const isLibrarian = user?.roles?.includes('LIBRARIAN');
    const { createBook, updateBook } = useLibraryMutations();

    const {
        register, handleSubmit, reset, setValue, watch,
        formState: { errors, isSubmitting }
    } = useForm<BookFormValues>({
        defaultValues: {
            title: '',
            author: '',
            categoryId: '',
            description: '',
            isbn: '',
            coverUrl: '',
            // Non-librarians can only create MEMBER books
            ownershipType: isLibrarian ? 'CHURCH' : 'MEMBER',
        }
    });

    useEffect(() => {
        if (open) {
            if (bookToEdit) {
                reset({
                    title: bookToEdit.title ?? '',
                    author: bookToEdit.author ?? '',
                    categoryId: bookToEdit.categoryId ?? bookToEdit.category?.id ?? '',
                    description: bookToEdit.description ?? '',
                    isbn: bookToEdit.isbn ?? '',
                    coverUrl: bookToEdit.coverUrl ?? '',
                    ownershipType: bookToEdit.ownershipType ?? 'CHURCH',
                });
            } else {
                reset({
                    title: '',
                    author: '',
                    categoryId: '',
                    description: '',
                    isbn: '',
                    coverUrl: '',
                    ownershipType: isLibrarian ? 'CHURCH' : 'MEMBER',
                });
            }
        }
    }, [bookToEdit, open, reset, isLibrarian]);

    const onSubmit = async (data: BookFormValues) => {
        // Build clean payload — no isChurchOwned, only ownershipType
        const cleanData: any = {
            title: data.title,
            author: data.author,
            categoryId: data.categoryId,
            description: data.description || undefined,
            isbn: data.isbn || undefined,
            coverUrl: data.coverUrl || undefined,
        };

        if (!bookToEdit) {
            cleanData.ownershipType = data.ownershipType;
        }

        try {
            if (bookToEdit) {
                await updateBook.mutateAsync({ id: bookToEdit.id, data: cleanData });
            } else {
                await createBook.mutateAsync(cleanData);
            }
            toast.success(bookToEdit ? 'Libro actualizado' : 'Libro creado');
            onOpenChange(false);
            reset();
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.map((e: any) => e?.constraints ? Object.values(e.constraints).join(', ') : e).join(' | ') : msg ?? 'Error al guardar libro');
        }
    };

    const ownershipValue = watch('ownershipType');
    const categoryValue = watch('categoryId');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{bookToEdit ? 'Editar Libro' : 'Nuevo Libro'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Title */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="title">Título *</Label>
                        <Input id="title" {...register('title', { required: 'El título es obligatorio' })} />
                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    {/* Author */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="author">Autor *</Label>
                        <Input id="author" {...register('author', { required: 'El autor es obligatorio' })} />
                        {errors.author && <p className="text-xs text-red-500">{errors.author.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Category — required */}
                        <div className="grid gap-1.5">
                            <Label>Categoría *</Label>
                            <Select
                                value={categoryValue}
                                onValueChange={(val) => setValue('categoryId', val, { shouldValidate: true })}
                            >
                                <SelectTrigger className={!categoryValue && errors.categoryId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={categories.length ? 'Seleccionar' : 'Sin categorías'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
                            {categories.length === 0 && (
                                <p className="text-xs text-amber-600">No hay categorías disponibles.</p>
                            )}
                        </div>

                        {/* ISBN */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="isbn">ISBN (Opcional)</Label>
                            <Input id="isbn" {...register('isbn')} />
                        </div>
                    </div>

                    {/* Cover URL */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="coverUrl">URL de Portada (Opcional)</Label>
                        <Input id="coverUrl" {...register('coverUrl')} placeholder="https://..." />
                    </div>

                    {/* Description */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" {...register('description')} rows={2} />
                    </div>

                    {/* Ownership — only LIBRARIANs can switch to CHURCH */}
                    {isLibrarian && (
                        <div className="grid gap-1.5">
                            <Label>Tipo de propiedad</Label>
                            <Select
                                value={ownershipValue}
                                onValueChange={(val) => setValue('ownershipType', val as 'CHURCH' | 'MEMBER')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CHURCH">📖 Propiedad de la Iglesia</SelectItem>
                                    <SelectItem value="MEMBER">👤 Libro Personal</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {ownershipValue === 'CHURCH'
                                    ? 'El libro pertenece a la iglesia y puede ser gestionado por el bibliotecario.'
                                    : 'El libro es tuyo. Vos aprobás los préstamos.'}
                            </p>
                        </div>
                    )}

                    {/* Hidden ownershipType for non-librarians */}
                    <input type="hidden" {...register('ownershipType')} />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                            {bookToEdit ? 'Guardar cambios' : 'Crear libro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
