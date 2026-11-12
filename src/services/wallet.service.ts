import { apiClient } from '@/lib/axios';
import { handleApiError } from '@/lib/api-error';
import type { ApiResponse, WalletTransaction } from '@/types';

export const walletService = {
  async getTransactions(): Promise<{
    transactions?: WalletTransaction[];
    balance?: number;
    walletBalance?: number;
  }> {
    try {
      const response = await apiClient.get('/api/wallet/transactions');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createTransaction(payload: Record<string, unknown>): Promise<ApiResponse<WalletTransaction> & { balance?: number }> {
    try {
      const response = await apiClient.post('/api/wallet/transactions', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
