import { apiClient } from './client';
import type { MonthlySummary } from '../types';

export const summaryApi = {
  getSummary: async (month?: string): Promise<MonthlySummary> => {
    const response = await apiClient.get<MonthlySummary>('/summary', {
      params: month ? { month } : undefined,
    });
    return response.data;
  },
};
