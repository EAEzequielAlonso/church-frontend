import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLibraryMutations } from '../hooks/useLibrary';
import { BookCategory } from '../types/library.types';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface BookDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: BookCategory[];
    bookToEdit?: any;
}

export function BookDialog({ open, onOpenChange, categories, bookToEdit }: BookDialogProps) {
    const { createBook, updateBook } = useLibraryMutations();
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            title: '',
            author: '',
            categoryId: '',
            description: '',
            isbn: '',
            coverUrl: '',
            isChurchOwned: true,
        }
    });

    useEffect(() => {
        if (bookToEdit) {
            reset(bookToEdit);
            setValue('categoryId', bookToEdit.categoryId);
        } else {
            reset({ isChurchOwned: true });
        }
    }, [bookToEdit, reset, setValue]);

    const onSubmit = (data: any) => {
        // Filter data to only include fields allowed by CreateBookDto/UpdateBookDto
        const cleanData = {
            title: data.title,
            author: data.author,
            categoryId: data.categoryId,
            description: data.description,
            isbn: data.isbn,
            coverUrl: data.coverUrl,
            isChurchOwned: data.isChurchOwned,
            // Add other optional DTO fields if form supports them
            // database fields like id, createdAt, updatedAt, category (object) will be excluded
        };

        const promise = bookToEdit
            ? updateBook.mutateAsync({ id: bookToEdit.id, data: cleanData })
            : createBook.mutateAsync(cleanData);

        toast.promise(promise, {
            loading: 'Guardando libro...',
            success: 'Libro guardado',
            error: (err: any) => {
                // Better error logging
                console.error("Error details:", err);
                return `Error al guardar libro: ${err.response?.data?.message || err.message}`;
            }
        });

        promise.then(() => {
            onOpenChange(false);
            reset();
        }).catch(err => {
            console.error("Promise rejected", err);
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{bookToEdit ? 'Editar Libro' : 'Nuevo Libro'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" {...register('title', { required: true })} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="author">Autor</Label>
                        <Input id="author" {...register('author', { required: true })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Categoría</Label>
                            <Select onValueChange={(val) => setValue('categoryId', val)} defaultValue={watch('categoryId')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="isbn">ISBN (Opcional)</Label>
                            <Input id="isbn" {...register('isbn')} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="coverUrl">URL de Portada (Opcional)</Label>
                        <Input id="coverUrl" {...register('coverUrl')} placeholder="https://..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" {...register('description')} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isChurchOwned"
                            checked={watch('isChurchOwned')}
                            onCheckedChange={(c) => setValue('isChurchOwned', c as boolean)}
                        />
                        <Label htmlFor="isChurchOwned">Propiedad de la Iglesia</Label>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
