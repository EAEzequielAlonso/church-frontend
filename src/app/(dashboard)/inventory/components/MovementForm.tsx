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
    InventoryItem,
    InventoryMovementType,
    InventoryReason,
    INVENTORY_REASON_LABELS,
    IN_REASONS,
    OUT_REASONS,
    RegisterMovementDto,
} from '@/features/inventory/types/inventory.types';
import { useInventoryMutations } from '@/features/inventory/hooks/useInventory';

interface Props {
    item: InventoryItem;
    type: InventoryMovementType;
    onSuccess: () => void;
}

export default function MovementForm({ item, type, onSuccess }: Props) {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterMovementDto>();
    const { registerMovement } = useInventoryMutations();

    const reasons = type === 'IN' ? IN_REASONS : OUT_REASONS;
    const maxQty = type === 'OUT' ? item.quantity : undefined;

    const onSubmit = async (data: RegisterMovementDto) => {
        await registerMovement.mutateAsync({
            itemId: item.id,
            type,
            quantity: Number(data.quantity),
            reason: data.reason,
            observation: data.observation,
        });
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Context banner */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{item.name}</span>
                <span className="mx-2">·</span>
                Stock actual: <span className="font-semibold text-slate-900">{item.quantity}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label>Cantidad *</Label>
                    <Input
                        type="number"
                        min={1}
                        max={maxQty}
                        placeholder="1"
                        {...register('quantity', {
                            required: true,
                            min: 1,
                            ...(maxQty !== undefined && { max: maxQty }),
                        })}
                        className={errors.quantity ? 'border-red-400' : ''}
                    />
                    {errors.quantity && (
                        <span className="text-xs text-red-500">
                            {maxQty !== undefined ? `Máximo disponible: ${maxQty}` : 'Cantidad requerida'}
                        </span>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label>Motivo *</Label>
                    <Select onValueChange={(v) => setValue('reason', v as InventoryReason)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                            {reasons.map(r => (
                                <SelectItem key={r} value={r}>
                                    {INVENTORY_REASON_LABELS[r]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Observación (Opcional)</Label>
                <Textarea
                    {...register('observation')}
                    placeholder="Detalles adicionales..."
                    rows={2}
                />
            </div>

            <Button
                type="submit"
                className="w-full"
                variant={type === 'OUT' ? 'destructive' : 'default'}
                disabled={registerMovement.isPending}
            >
                {registerMovement.isPending
                    ? 'Guardando...'
                    : type === 'IN' ? 'Confirmar Ingreso' : 'Confirmar Egreso'
                }
            </Button>
        </form>
    );
}
