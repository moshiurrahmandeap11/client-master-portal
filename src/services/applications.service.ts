import { apiClient } from '@/lib/axios';
import { handleApiError } from '@/lib/api-error';
import type { ApiResponse, ApplicationRequest } from '@/types';

export const applicationsService = {
  async getApplications(): Promise<{ applications?: ApplicationRequest[]; data?: ApplicationRequest[] }> {
    try {
      const response = await apiClient.get('/api/applications');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getApplicationById(id: string): Promise<{ application?: ApplicationRequest; data?: ApplicationRequest }> {
    try {
      const response = await apiClient.get(`/api/applications/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createApplication(payload: Partial<ApplicationRequest> & Record<string, unknown>): Promise<ApiResponse<ApplicationRequest> & { application?: ApplicationRequest }> {
    try {
      const response = await apiClient.post('/api/applications', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateApplication(id: string, payload: Partial<ApplicationRequest> & Record<string, unknown>): Promise<ApiResponse<ApplicationRequest>> {
    try {
      const response = await apiClient.patch(`/api/applications/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAvailableDiscounts(): Promise<{ coupons?: unknown[]; discounts?: unknown[] }> {
    try {
      const response = await apiClient.get('/api/discounts/available');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async validateDiscount(payload: { code: string; jobId?: string; fee?: number }): Promise<Record<string, unknown>> {
    try {
      const response = await apiClient.post('/api/discounts/validate', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
