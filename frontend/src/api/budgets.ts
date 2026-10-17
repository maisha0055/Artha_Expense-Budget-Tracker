import { apiClient } from './client';
import type { CategoryBudget, SetBudgetRequest } from '../types';

export const budgetsApi = {
  getAll: async (month?: string): Promise<CategoryBudget[]> => {
    const response = await apiClient.get<CategoryBudget[]>('/budgets', {
      params: month ? { month } : undefined,
    });
    return response.data;
  },

  setBudget: async (data: SetBudgetRequest): Promise<CategoryBudget> => {
    const response = await apiClient.put<CategoryBudget>('/budgets', data);
    return response.data;
  },
};
