import { MinistryModel } from './ministry.types';
import { TreasuryAccountModel } from './treasury.types';

export interface BudgetModel {
    id: string;
    ministry?: MinistryModel;
    category?: TreasuryAccountModel;
    amountLimit: number;
    period: 'monthly' | 'yearly' | 'event';
    year: number;
}

export interface CreateBudgetDto {
    ministryId?: string;
    categoryId?: string;
    amountLimit: number;
    period: 'monthly' | 'yearly';
    year: number;
    churchId: string;
}

export interface UpdateBudgetDto extends Partial<CreateBudgetDto> { }
