import api from '@/lib/api';
import {
    InventoryItem,
    InventoryMovement,
    PaginatedMovements,
    CreateInventoryItemDto,
    UpdateInventoryItemDto,
    RegisterMovementDto,
} from '../types/inventory.types';

export const inventoryApi = {
    getItems: async (filters?: {
        ministryId?: string;
        category?: string;
    }): Promise<InventoryItem[]> => {
        const { data } = await api.get<InventoryItem[]>('/inventory', {
            params: filters,
        });
        return data;
    },

    getItem: async (id: string): Promise<InventoryItem> => {
        const { data } = await api.get<InventoryItem>(`/inventory/${id}`);
        return data;
    },

    createItem: async (dto: CreateInventoryItemDto): Promise<InventoryItem> => {
        const { data } = await api.post<InventoryItem>('/inventory', dto);
        return data;
    },

    updateItem: async (id: string, dto: UpdateInventoryItemDto): Promise<InventoryItem> => {
        const { data } = await api.patch<InventoryItem>(`/inventory/${id}`, dto);
        return data;
    },

    registerMovement: async (dto: RegisterMovementDto): Promise<InventoryMovement> => {
        const { data } = await api.post<InventoryMovement>('/inventory/movement', dto);
        return data;
    },

    getMovements: async (params: {
        itemId?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedMovements> => {
        const { data } = await api.get<PaginatedMovements>('/inventory/movements', {
            params,
        });
        return data;
    },

    deactivateItem: async (id: string): Promise<InventoryItem> => {
        const { data } = await api.patch<InventoryItem>(`/inventory/${id}/deactivate`);
        return data;
    },

    deleteItem: async (id: string): Promise<void> => {
        await api.delete(`/inventory/${id}`);
    },
};
