import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { BudgetAllocationResult } from "../types/budget.types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BudgetAllocationDialog } from "./BudgetAllocationDialog";
import { useBudgetAllocations } from "../hooks/useBudgetAllocations";

interface Props {
    periodId: string;
    allocations: BudgetAllocationResult[];
    isLoading: boolean;
}

export function BudgetExecutionTable({ periodId, allocations, isLoading }: Props) {
    const { deleteAllocation } = useBudgetAllocations(periodId);
    const [editingAllocation, setEditingAllocation] = useState<BudgetAllocationResult | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (deletingId) {
            await deleteAllocation(deletingId);
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return <div>Cargando detalle de ejecución...</div>;
    }

    if (allocations.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">No hay asignaciones presupuestarias para este periodo.</div>;
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ministerio / Categoría</TableHead>
                            <TableHead className="text-right">Presupuesto</TableHead>
                            <TableHead className="text-right">Ejecutado</TableHead>
                            <TableHead className="text-right">Disponible</TableHead>
                            <TableHead className="w-[150px]">Estado</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allocations.map((item) => (
                            <TableRow key={item.allocationId}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.ministry?.name || "Sin Ministerio"}</span>
                                        {item.category && (
                                            <Badge variant="outline" className="w-fit mt-1 text-xs">
                                                {item.category.name}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(item.budgetAmount)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.spentAmount)}</TableCell>
                                <TableCell className={`text-right font-bold ${item.remainingAmount < 0 ? "text-red-500" : ""}`}>
                                    {formatCurrency(item.remainingAmount)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-xs">
                                            <span>{item.usagePercentage.toFixed(0)}%</span>
                                        </div>
                                        <Progress
                                            value={Math.min(item.usagePercentage, 100)}
                                            className={`h-2 ${item.usagePercentage > 100 ? "bg-red-100 [&>div]:bg-red-500" : ""}`}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setEditingAllocation(item)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeletingId(item.allocationId)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            {editingAllocation && (
                <BudgetAllocationDialog
                    periodId={periodId}
                    isOpenControlled={true}
                    onClose={() => setEditingAllocation(null)}
                    allocationToEdit={{
                        id: editingAllocation.allocationId,
                        amount: editingAllocation.budgetAmount,
                        ministry: editingAllocation.ministry || undefined,
                        category: editingAllocation.category || undefined
                    }}
                />
            )}

            {/* Delete Alert */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Eliminará la asignación presupuestaria.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
