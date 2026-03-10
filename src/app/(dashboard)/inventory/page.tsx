'use client';

import { useState } from 'react';
import {
    InventoryItem,
    InventoryMovementType,
    InventoryItemCategory,
    INVENTORY_CATEGORY_LABELS,
} from '@/features/inventory/types/inventory.types';
import { useInventoryItems } from '@/features/inventory/hooks/useInventory';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Package, Plus, Search, Layers } from 'lucide-react';
import CreateItemForm from './components/CreateItemForm';
import MovementForm from './components/MovementForm';
import MovementHistory from './components/MovementHistory';
import InventoryCard from './components/InventoryCard';

export default function InventoryPage() {
    const { user } = useAuth();
    const canEdit = user?.roles?.includes('MINISTRY_LEADER') ?? false;

    // Filters
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Data
    const { data: items = [], isLoading } = useInventoryItems();

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isMovementOpen, setIsMovementOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [movementType, setMovementType] = useState<InventoryMovementType>('IN');

    const handleMovement = (item: InventoryItem, type: InventoryMovementType) => {
        setSelectedItem(item);
        setMovementType(type);
        setIsMovementOpen(true);
    };

    const handleHistory = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsHistoryOpen(true);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Stats
    const totalStock = items.reduce((acc, i) => acc + i.quantity, 0);
    const lowStockCount = items.filter(i => i.quantity <= 2 && i.quantity > 0).length;
    const uniqueCategories = new Set(items.map(i => i.category)).size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventario</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Gestión de bienes y recursos físicos</p>
                </div>
                {canEdit && (
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" />
                        Nuevo Ítem
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Ítems</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{items.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Unidades en Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStock}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Stock Bajo
                            {lowStockCount > 0 && (
                                <span className="ml-2 text-red-500">⚠</span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                            {lowStockCount}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <Layers className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {Object.values(InventoryItemCategory).map(cat => (
                            <SelectItem key={cat} value={cat}>
                                {INVENTORY_CATEGORY_LABELS[cat]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[340px] rounded-xl border border-slate-200 bg-slate-100 animate-pulse" />
                    ))
                ) : filteredItems.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-600">Inventario vacío</h3>
                        <p className="text-slate-400 mt-1 text-sm">
                            {search || categoryFilter !== 'all'
                                ? 'No se encontraron ítems con los filtros actuales.'
                                : canEdit ? 'Creá tu primer ítem usando el botón "Nuevo Ítem".' : 'No hay ítems registrados aún.'
                            }
                        </p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <InventoryCard
                            key={item.id}
                            item={item}
                            canEdit={canEdit}
                            categoryLabel={INVENTORY_CATEGORY_LABELS[item.category] ?? item.category}
                            onMovement={handleMovement}
                            onHistory={handleHistory}
                        />
                    ))
                )}
            </div>

            {/* Create Item Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Nuevo Ítem de Inventario</DialogTitle>
                    </DialogHeader>
                    <CreateItemForm onSuccess={() => setIsCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Movement Dialog */}
            <Dialog open={isMovementOpen} onOpenChange={setIsMovementOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {movementType === 'IN' ? '📦 Registrar Ingreso' : '📤 Registrar Egreso'}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <MovementForm
                            item={selectedItem}
                            type={movementType}
                            onSuccess={() => setIsMovementOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Historial — {selectedItem?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedItem && <MovementHistory item={selectedItem} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
