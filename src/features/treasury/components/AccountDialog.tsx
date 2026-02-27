
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateAccountDto, TreasuryAccountModel, AccountType } from "../types/treasury.types";
import { useCreateAccount, useUpdateAccount } from "../hooks/useAccounts";
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
            balance: 0
        }
    });

    const { execute: createAccount, isLoading: isCreating } = useCreateAccount();
    const { execute: updateAccount, isLoading: isUpdating } = useUpdateAccount();
    const { createCategory, isLoading: isCreatingCategory } = useCategories(); // For category creation

    const isLoading = isCreating || isUpdating || isCreatingCategory;

    useEffect(() => {
        if (open) {
            if (accountToEdit) {
                setValue('name', accountToEdit.name);
                setValue('type', accountToEdit.type);
                setValue('currency', accountToEdit.currency);
                setValue('balance', accountToEdit.balance);
            } else if (categoryToEdit) {
                setValue('name', categoryToEdit.name);
                setValue('type', categoryToEdit.type);
                // Categories don't have currency/balance
            } else {
                reset({
                    name: '',
                    type: mode === 'account' ? AccountType.ASSET : 'income',
                    currency: 'ARS',
                    balance: 0
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
            if (categoryToEdit) {
                // TODO: Add updateCategory to hook
                console.log("Update Category", categoryToEdit.id, data);
                // For now, close. 
                onSuccess();
            } else {
                await createCategory({
                    name: data.name,
                    type: data.type,
                    churchId: 'auto'
                });
                onSuccess();
            }
        } else {
            // Account Logic
            const payload: CreateAccountDto = {
                name: data.name,
                type: data.type,
                currency: data.currency,
                balance: Number(data.balance),
                churchId: ''
            };

            if (accountToEdit) {
                await updateAccount(accountToEdit.id, payload, onSuccess);
            } else {
                await createAccount(payload, onSuccess);
            }
        }
    };

    const handleTypeChange = (value: string) => setValue('type', value);
    const handleCurrencyChange = (value: string) => setValue('currency', value);

    const isCategoryMode = mode === 'category';

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
                            <Select onValueChange={handleTypeChange} defaultValue={watch('type')}>
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
                        </div>

                        {!isCategoryMode && (
                            <div className="grid gap-2">
                                <Label>Moneda</Label>
                                <Select onValueChange={handleCurrencyChange} defaultValue={accountToEdit?.currency || "ARS"}>
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
                            {accountToEdit && <span className="text-xs text-muted-foreground">El balance se ajusta mediante transacciones.</span>}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {accountToEdit ? 'Guardar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
