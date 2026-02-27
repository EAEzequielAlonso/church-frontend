import { Card, CardContent } from '@/components/ui/card';
import { TransactionCategory } from '../types/treasury.types';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CategoriesListProps {
    categories: TransactionCategory[];
    onEdit?: (category: TransactionCategory) => void;
    onDelete?: (id: string) => void;
    canEdit: boolean;
}

export function CategoriesList({ categories, onEdit, onDelete, canEdit }: CategoriesListProps) {
    if (categories.length === 0) return <div className="text-slate-400 text-sm">No hay registros.</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(new Map(categories.map(cat => [cat.id, cat])).values()).map(cat => (
                <Card key={cat.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-1">
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold ${cat.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                {cat.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </Badge>
                            {cat.color && (
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Tag className="w-4 h-4 text-slate-400" />
                            <h3 className="font-semibold text-slate-700 truncate" title={cat.name}>{cat.name}</h3>
                        </div>

                        {canEdit && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-md shadow-sm backdrop-blur-sm">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit?.(cat)}>
                                    <Edit2 className="h-3 w-3 text-blue-500" />
                                </Button>
                                {/* Deletions of categories might be risky if used in txs. Provide prompt. */}
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete?.(cat.id)}>
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
