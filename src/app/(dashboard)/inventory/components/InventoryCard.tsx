'use client';

import { useState } from 'react';
import { InventoryItem, InventoryMovementType } from '@/features/inventory/types/inventory.types';
import { useInventoryMutations } from '@/features/inventory/hooks/useInventory';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Minus, History, ImageIcon,
    MoreVertical, PowerOff, Trash2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InventoryCardProps {
    item: InventoryItem;
    categoryLabel: string;
    canEdit: boolean;
    onMovement: (item: InventoryItem, type: InventoryMovementType) => void;
    onHistory: (item: InventoryItem) => void;
}

export default function InventoryCard({
    item,
    categoryLabel,
    canEdit,
    onMovement,
    onHistory,
}: InventoryCardProps) {
    const [imgError, setImgError] = useState(false);
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { deactivateItem, deleteItem } = useInventoryMutations();
    const isLowStock = item.quantity > 0 && item.quantity <= 2;

    return (
        <>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full border-slate-200">
                {/* Image */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                    {item.imageUrl && !imgError ? (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                            <ImageIcon className="w-10 h-10 mb-1 opacity-40" />
                            <span className="text-xs font-medium uppercase tracking-wider">Sin Imagen</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm font-semibold text-slate-700 text-xs">
                            {categoryLabel}
                        </Badge>
                    </div>

                    {/* Three-dot menu (only for editors) */}
                    {canEdit && (
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-7 w-7 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white"
                                    >
                                        <MoreVertical className="w-3.5 h-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    <DropdownMenuItem
                                        className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 gap-2"
                                        onClick={() => setConfirmDeactivate(true)}
                                    >
                                        <PowerOff className="w-3.5 h-3.5" />
                                        Desactivar ítem
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 gap-2"
                                        onClick={() => setConfirmDelete(true)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Eliminar permanente
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                {/* Content */}
                <CardContent className="p-4 flex-grow">
                    <h3 className="font-bold text-base text-slate-800 line-clamp-1 mb-1" title={item.name}>
                        {item.name}
                    </h3>
                    {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                    )}

                    <div className="flex items-end justify-between mt-auto pt-2">
                        <div>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Stock</span>
                            <span className={`text-2xl font-bold ${isLowStock ? 'text-amber-500' : item.quantity === 0 ? 'text-red-500' : 'text-slate-800'}`}>
                                {item.quantity}
                            </span>
                            {isLowStock && <span className="text-xs text-amber-400 block">Stock bajo</span>}
                            {item.quantity === 0 && <span className="text-xs text-red-500 font-semibold block">Sin stock</span>}
                        </div>
                        {item.ministry && (
                            <div className="text-right">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Ministerio</span>
                                <p className="text-sm font-semibold text-indigo-600 truncate max-w-[110px]">
                                    {item.ministry.name}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>

                {/* Actions */}
                <CardFooter className={`p-2 bg-slate-50 border-t border-slate-100 gap-1 ${canEdit ? 'grid grid-cols-3' : 'flex justify-center'}`}>
                    {canEdit && (
                        <>
                            <Button
                                variant="ghost" size="sm"
                                className="w-full text-green-600 hover:text-green-700 hover:bg-green-100 text-xs"
                                onClick={() => onMovement(item, 'IN')}
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" /> Ingreso
                            </Button>
                            <Button
                                variant="ghost" size="sm"
                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-100 text-xs"
                                onClick={() => onMovement(item, 'OUT')}
                                disabled={item.quantity === 0}
                            >
                                <Minus className="w-3.5 h-3.5 mr-1" /> Egreso
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost" size="sm"
                        className="w-full text-slate-600 hover:text-indigo-600 hover:bg-slate-200 text-xs"
                        onClick={() => onHistory(item)}
                    >
                        <History className="w-3.5 h-3.5 mr-1" /> Historial
                    </Button>
                </CardFooter>
            </Card>

            {/* ── Confirm Deactivate ────────────────────────────────── */}
            <AlertDialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar ítem?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{item.name}</strong> quedará inactivo y desaparecerá del inventario activo.
                            El historial de movimientos se conserva completo y podrás reactivarlo en el futuro.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-amber-500 hover:bg-amber-600"
                            onClick={() => deactivateItem.mutate(item.id)}
                        >
                            Sí, desactivar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Confirm Delete ────────────────────────────────────── */}
            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar permanentemente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción <strong>no se puede deshacer</strong>. Se eliminará{' '}
                            <strong>{item.name}</strong> junto con <strong>todo su historial de movimientos</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteItem.mutate(item.id)}
                        >
                            Sí, eliminar todo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
