import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import {
    CreateInventoryItemDto,
    UpdateInventoryItemDto,
    RegisterMovementDto,
} from '../types/inventory.types';
import { toast } from 'sonner';

// ─── Query keys ──────────────────────────────────────────────────────────────

const KEYS = {
    items: (filters?: object) => ['inventory', 'items', filters] as const,
    item: (id: string) => ['inventory', 'item', id] as const,
    movements: (params?: object) => ['inventory', 'movements', params] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useInventoryItems(filters?: { ministryId?: string; category?: string }) {
    return useQuery({
        queryKey: KEYS.items(filters),
        queryFn: () => inventoryApi.getItems(filters),
    });
}

export function useInventoryItem(id: string) {
    return useQuery({
        queryKey: KEYS.item(id),
        queryFn: () => inventoryApi.getItem(id),
        enabled: !!id,
    });
}

export function useInventoryMovements(params: {
    itemId?: string;
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: KEYS.movements(params),
        queryFn: () => inventoryApi.getMovements(params),
        enabled: !!params.itemId || params.page !== undefined,
    });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useInventoryMutations() {
    const qc = useQueryClient();

    const invalidateItems = () => qc.invalidateQueries({ queryKey: ['inventory', 'items'] });
    const invalidateMovements = () => qc.invalidateQueries({ queryKey: ['inventory', 'movements'] });

    const createItem = useMutation({
        mutationFn: (dto: CreateInventoryItemDto) => inventoryApi.createItem(dto),
        onSuccess: () => {
            invalidateItems();
            toast.success('Ítem creado correctamente');
        },
        onError: () => toast.error('Error al crear el ítem'),
    });

    const updateItem = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateInventoryItemDto }) =>
            inventoryApi.updateItem(id, dto),
        onSuccess: () => {
            invalidateItems();
            toast.success('Ítem actualizado');
        },
        onError: () => toast.error('Error al actualizar el ítem'),
    });

    const registerMovement = useMutation({
        mutationFn: (dto: RegisterMovementDto) => inventoryApi.registerMovement(dto),
        onSuccess: () => {
            invalidateItems();
            invalidateMovements();
            toast.success('Movimiento registrado');
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message ?? 'Error al registrar movimiento';
            toast.error(msg);
        },
    });

    const deactivateItem = useMutation({
        mutationFn: (id: string) => inventoryApi.deactivateItem(id),
        onSuccess: () => {
            invalidateItems();
            toast.success('Ítem desactivado. El historial se conserva.');
        },
        onError: () => toast.error('Error al desactivar el ítem'),
    });

    const deleteItem = useMutation({
        mutationFn: (id: string) => inventoryApi.deleteItem(id),
        onSuccess: () => {
            invalidateItems();
            invalidateMovements();
            toast.success('Ítem eliminado permanentemente');
        },
        onError: () => toast.error('Error al eliminar el ítem'),
    });

    return { createItem, updateItem, registerMovement, deactivateItem, deleteItem };
}
