export const formatCurrency = (amount: number, currency: string = 'ARS') => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount);
};
