export type InventoryMovementType = 'IN' | 'OUT';

export enum InventoryItemCategory {
    FURNITURE = 'FURNITURE',
    SOUND = 'SOUND',
    INSTRUMENTS = 'INSTRUMENTS',
    TECHNOLOGY = 'TECHNOLOGY',
    LIGHTING = 'LIGHTING',
    KITCHEN = 'KITCHEN',
    STATIONERY = 'STATIONERY',
    DECORATION = 'DECORATION',
    OTHER = 'OTHER',
}

export enum InventoryReason {
    PURCHASE = 'PURCHASE',
    DONATION = 'DONATION',
    TRANSFER = 'TRANSFER',
    BROKEN = 'BROKEN',
    LOST = 'LOST',
    ADJUSTMENT = 'ADJUSTMENT',
}

export const INVENTORY_REASON_LABELS: Record<InventoryReason, string> = {
    [InventoryReason.PURCHASE]: 'Compra',
    [InventoryReason.DONATION]: 'Donación',
    [InventoryReason.TRANSFER]: 'Traslado',
    [InventoryReason.BROKEN]: 'Roto / Dañado',
    [InventoryReason.LOST]: 'Perdido / Robado',
    [InventoryReason.ADJUSTMENT]: 'Ajuste de inventario',
};

export const INVENTORY_CATEGORY_LABELS: Record<InventoryItemCategory, string> = {
    [InventoryItemCategory.FURNITURE]: 'Mobiliario',
    [InventoryItemCategory.SOUND]: 'Sonido',
    [InventoryItemCategory.INSTRUMENTS]: 'Instrumentos',
    [InventoryItemCategory.TECHNOLOGY]: 'Tecnología',
    [InventoryItemCategory.LIGHTING]: 'Iluminación',
    [InventoryItemCategory.KITCHEN]: 'Cocina',
    [InventoryItemCategory.STATIONERY]: 'Papelería',
    [InventoryItemCategory.DECORATION]: 'Decoración',
    [InventoryItemCategory.OTHER]: 'Otros',
};

// Reasons valid per movement type
export const IN_REASONS = [
    InventoryReason.PURCHASE,
    InventoryReason.DONATION,
    InventoryReason.TRANSFER,
    InventoryReason.ADJUSTMENT,
] as const;

export const OUT_REASONS = [
    InventoryReason.BROKEN,
    InventoryReason.LOST,
    InventoryReason.TRANSFER,
    InventoryReason.ADJUSTMENT,
] as const;

export interface Ministry {
    id: string;
    name: string;
}

export interface InventoryItem {
    id: string;
    churchId: string;
    name: string;
    category: InventoryItemCategory;
    description?: string;
    imageUrl?: string;
    location?: string;
    quantity: number;
    status: 'active' | 'inactive';
    ministryId?: string;
    ministry?: Ministry;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryMovement {
    id: string;
    churchId: string;
    itemId: string;
    item?: Pick<InventoryItem, 'id' | 'name'>;
    type: InventoryMovementType;
    quantity: number;
    reason: InventoryReason;
    observation?: string;
    registeredBy?: {
        id: string;
        person?: { fullName: string };
    };
    date: string;
    createdAt: string;
}

export interface PaginatedMovements {
    data: InventoryMovement[];
    total: number;
    page: number;
    lastPage: number;
}

// DTOs
export interface CreateInventoryItemDto {
    name: string;
    category: InventoryItemCategory;
    description?: string;
    imageUrl?: string;
    location?: string;
    initialQuantity?: number;
    ministryId?: string;
}

export interface UpdateInventoryItemDto {
    name?: string;
    category?: InventoryItemCategory;
    description?: string;
    imageUrl?: string;
    location?: string;
    ministryId?: string;
}

export interface RegisterMovementDto {
    itemId: string;
    type: InventoryMovementType;
    quantity: number;
    reason: InventoryReason;
    observation?: string;
}
