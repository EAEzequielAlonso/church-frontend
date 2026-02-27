
import api from "@/lib/api";

export const getReportsSummary = async (startDate: string, endDate: string) => {
    const response = await api.get(`/treasury/reports/summary`, { params: { startDate, endDate } });
    return response.data;
};

export const getCashflowReport = async (startDate: string, endDate: string) => {
    const response = await api.get(`/treasury/reports/cashflow`, { params: { startDate, endDate } });
    return response.data;
};

export const getCategoryBreakdown = async (startDate: string, endDate: string, type: string) => {
    const response = await api.get(`/treasury/reports/category-breakdown`, { params: { startDate, endDate, type } });
    return response.data;
};

export const getMinistryBreakdown = async (startDate: string, endDate: string) => {
    const response = await api.get(`/treasury/reports/ministry-breakdown`, { params: { startDate, endDate } });
    return response.data;
};

export const getAccountBalances = async () => {
    const response = await api.get(`/treasury/reports/account-balances`);
    return response.data;
};

export const getTrendAnalysis = async (months: number = 12) => {
    const response = await api.get(`/treasury/reports/trends`, { params: { months } });
    return response.data;
};
