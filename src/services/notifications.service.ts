import { apiClient } from '@/lib/axios';
import { handleApiError } from '@/lib/api-error';
import type { ApiResponse, JobAlertPreference, NotificationItem } from '@/types';

export const notificationsService = {
  async getNotifications(): Promise<{ notifications?: NotificationItem[]; unreadCount?: number }> {
    try {
      const response = await apiClient.get('/api/candidate/notifications');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async markAsRead(payload: { id?: string; markAll?: boolean }): Promise<ApiResponse> {
    try {
      const response = await apiClient.patch('/api/candidate/notifications', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAlerts(): Promise<{ alerts?: JobAlertPreference }> {
    try {
      const response = await apiClient.get('/api/candidate/alerts');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async saveAlerts(payload: Partial<JobAlertPreference> & Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await apiClient.put('/api/candidate/alerts', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getJobReminders(): Promise<{ reminders?: unknown[] }> {
    try {
      const response = await apiClient.get('/api/candidate/job-reminders');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async toggleJobReminder(payload: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/candidate/job-reminders', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async submitContact(payload: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/contact', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
