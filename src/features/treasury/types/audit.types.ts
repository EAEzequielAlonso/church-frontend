
export interface TreasuryAuditLogModel {
    id: string;
    createdAt: string; // ISO
    oldAmount: number;
    newAmount: number;
    oldDescription: string;
    newDescription: string;
    changeReason: string;
    changedBy?: {
        id: string;
        email: string;
        person?: {
            firstName: string;
            lastName: string;
        };
    };
}
