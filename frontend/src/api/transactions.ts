import { apiClient } from './client';
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  PagedResult,
  TransactionType,
} from '../types';

export interface GetTransactionsParams {
  month?: string;
  categoryId?: number;
  type?: TransactionType;
  page?: number;
  pageSize?: number;
}

export const transactionsApi = {
  getAll: async (params?: GetTransactionsParams): Promise<PagedResult<Transaction>> => {
    const response = await apiClient.get<PagedResult<Transaction>>('/transactions', {
      params,
    });
    return response.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/transactions', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },
};
