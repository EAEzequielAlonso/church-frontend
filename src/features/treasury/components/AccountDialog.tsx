
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateAccountDto, TreasuryAccountModel, AccountType } from "../types/treasury.types";
import { useAccounts, useUpdateAccount } from "../hooks/useAccounts";
import { useCategories } from "../hooks/useCategories"; // NEW
import { Loader2 } from "lucide-react";

import { TransactionCategory } from "../types/treasury.types"; // NEW

interface AccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accountToEdit?: TreasuryAccountModel | null;
    categoryToEdit?: TransactionCategory | null; // NEW
    mode?: 'account' | 'category';
}

export function AccountDialog({ open, onOpenChange, accountToEdit, categoryToEdit, mode = 'account' }: AccountDialogProps) {
    // Form can accept Account data or Category data
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<any>({
        defaultValues: {
            name: '',
            type: mode === 'account' ? AccountType.ASSET : 'income',
            currency: 'ARS',
            balance: 0,
            isArchived: false
        }
    });

    const { createAccount, isLoading: isCreating } = useAccounts();
    const { execute: updateAccount, isLoading: isUpdating } = useUpdateAccount();
    const { createCategory, updateCategory, isLoading: isCreatingCategory } = useCategories(); // For category creation

    const isLoading = isCreating || isUpdating || isCreatingCategory;

    useEffect(() => {
        if (open) {
            if (accountToEdit) {
                setValue('name', accountToEdit.name);
                setValue('type', accountToEdit.type);
                setValue('currency', accountToEdit.currency);
                setValue('balance', accountToEdit.balance);
                setValue('isArchived', accountToEdit.isArchived || false);
            } else if (categoryToEdit) {
                setValue('name', categoryToEdit.name);
                setValue('type', categoryToEdit.type);
            } else {
                reset({
                    name: '',
                    type: mode === 'account' ? AccountType.ASSET : 'income',
                    currency: 'ARS',
                    balance: 0,
                    isArchived: false
                });
            }
        }
    }, [accountToEdit, categoryToEdit, open, setValue, reset, mode]);

    const onSubmit = async (data: any) => {
        const onSuccess = () => {
            onOpenChange(false);
            reset();
        };

        if (mode === 'category') {
            const payload: any = {
                name: data.name,
                isArchived: data.isArchived
            };

            if (!categoryToEdit || !categoryToEdit.hasTransactions) {
                payload.type = data.type;
            }

            if (categoryToEdit) {
                await updateCategory(categoryToEdit.id, payload);
                onSuccess();
            } else {
                await createCategory({
                    ...payload,
                    churchId: 'auto'
                });
                onSuccess();
            }
        } else {
            // Account Logic
            const payload: any = {
                name: data.name,
                isArchived: data.isArchived
            };

            // Only send type/currency if they are editable (new or no transactions)
            if (!accountToEdit || !accountToEdit.hasTransactions) {
                payload.type = data.type;
                payload.currency = data.currency;
            }

            if (!accountToEdit) {
                payload.balance = Number(data.balance);
                payload.churchId = '';
                await createAccount(payload, onSuccess);
            } else {
                await updateAccount(accountToEdit.id, payload, onSuccess);
            }
        }
    };

    const handleTypeChange = (value: string) => setValue('type', value);
    const handleCurrencyChange = (value: string) => setValue('currency', value);

    const isCategoryMode = mode === 'category';
    const hasTransactions = accountToEdit?.hasTransactions || false;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{(accountToEdit || categoryToEdit) ? (isCategoryMode ? 'Editar Categoría' : 'Editar Cuenta') : (isCategoryMode ? 'Nueva Categoría' : 'Nueva Cuenta')}</DialogTitle>
                    <DialogDescription>
                        {isCategoryMode ? 'Gestiona los conceptos de ingresos y egresos.' : 'Gestiona tus cajas y cuentas bancarias.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" placeholder={isCategoryMode ? "Ej: Diezmos, Alquiler" : "Ej: Caja Chica, Banco Nación"} {...register("name", { required: true })} />
                        {errors.name && <span className="text-sm text-red-500">Requerido</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Tipo</Label>
                            <Select
                                onValueChange={handleTypeChange}
                                defaultValue={watch('type')}
                                disabled={!isCategoryMode && hasTransactions}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isCategoryMode ? (
                                        <>
                                            <SelectItem value="income">Ingreso</SelectItem>
                                            <SelectItem value="expense">Egreso</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value={AccountType.ASSET}>Activo (Caja/Banco)</SelectItem>
                                            <SelectItem value={AccountType.LIABILITY}>Pasivo (Deuda/Tarjeta)</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            {((!isCategoryMode && hasTransactions) || (isCategoryMode && categoryToEdit?.hasTransactions)) && (
                                <span className="text-[10px] text-amber-600 font-medium">Bloqueado por movimientos</span>
                            )}
                        </div>

                        {!isCategoryMode && (
                            <div className="grid gap-2">
                                <Label>Moneda</Label>
                                <Select
                                    onValueChange={handleCurrencyChange}
                                    defaultValue={accountToEdit?.currency || "ARS"}
                                    disabled={hasTransactions}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Moneda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ARS">ARS</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {!isCategoryMode && (
                        <div className="grid gap-2">
                            <Label htmlFor="balance">Balance Inicial</Label>
                            <Input
                                id="balance"
                                type="number"
                                step="0.01"
                                {...register("balance", { required: true })}
                                disabled={!!accountToEdit}
                            />
                            {accountToEdit && <span className="text-[10px] text-muted-foreground">El balance se ajusta mediante transacciones.</span>}
                        </div>
                    )}

                    {(accountToEdit || categoryToEdit) && (
                        <div className="flex items-center space-x-2 pt-2 border-t">
                            <input
                                type="checkbox"
                                id="isArchived"
                                {...register("isArchived")}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <Label htmlFor="isArchived" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {isCategoryMode ? 'Archivar categoría (No aparecerá en nuevos movimientos)' : 'Archivar cuenta (No aparecerá en nuevos movimientos)'}
                            </Label>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {accountToEdit ? 'Guardar Cambios' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
