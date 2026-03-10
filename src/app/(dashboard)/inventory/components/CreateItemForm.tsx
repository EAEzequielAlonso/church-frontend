'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    InventoryItemCategory,
    INVENTORY_CATEGORY_LABELS,
    CreateInventoryItemDto,
} from '@/features/inventory/types/inventory.types';
import { useInventoryMutations } from '@/features/inventory/hooks/useInventory';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Ministry { id: string; name: string; }

interface Props {
    onSuccess: () => void;
}

export default function CreateItemForm({ onSuccess }: Props) {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateInventoryItemDto>();
    const { createItem } = useInventoryMutations();
    const [ministries, setMinistries] = useState<Ministry[]>([]);

    useEffect(() => {
        api.get<Ministry[]>('/ministries').then(r => setMinistries(r.data)).catch(() => { });
    }, []);

    const onSubmit = async (data: CreateInventoryItemDto) => {
        await createItem.mutateAsync({
            ...data,
            initialQuantity: Number(data.initialQuantity) || 0,
            ministryId: data.ministryId && data.ministryId !== 'none' ? data.ministryId : undefined,
        });
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <Label>Nombre del Ítem *</Label>
                <Input
                    {...register('name', { required: true })}
                    placeholder="Ej: Sillas Plásticas"
                    className={errors.name ? 'border-red-400' : ''}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label>Categoría *</Label>
                    <Select onValueChange={(v) => setValue('category', v as InventoryItemCategory)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(InventoryItemCategory).map(cat => (
                                <SelectItem key={cat} value={cat}>
                                    {INVENTORY_CATEGORY_LABELS[cat]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label>Stock Inicial</Label>
                    <Input
                        type="number"
                        {...register('initialQuantity')}
                        placeholder="0"
                        min="0"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Ministerio (Opcional)</Label>
                <Select onValueChange={(v) => setValue('ministryId', v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Asignar a un ministerio..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">-- Ninguno --</SelectItem>
                        {ministries.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label>Ubicación (Opcional)</Label>
                <Input {...register('location')} placeholder="Ej: Armario Salón A" />
            </div>

            <div className="space-y-1.5">
                <Label>URL de Imagen (Opcional)</Label>
                <Input {...register('imageUrl')} placeholder="https://..." />
            </div>

            <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea {...register('description')} placeholder="Detalles del ítem..." rows={2} />
            </div>

            <Button type="submit" className="w-full" disabled={createItem.isPending}>
                {createItem.isPending ? 'Guardando...' : 'Crear Ítem'}
            </Button>
        </form>
    );
}
