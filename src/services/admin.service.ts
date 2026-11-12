import { apiClient, fetchAdmin } from '@/lib/axios';
import { handleApiError } from '@/lib/api-error';
import type {
  AdminAuditLog,
  ApiResponse,
  ApplicationRequest,
  CandidateProfile,
  CompanyProfile,
  Coupon,
  JobCircular,
  JobSource,
  MediaItem,
  PageRecord,
  PlatformSettings,
  RaffleCampaign,
  WalletTransaction,
} from '@/types';

export const adminService = {
  async getStats(): Promise<Record<string, unknown>> {
    try {
      const response = await apiClient.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getPlatformSettings(): Promise<{ settings?: PlatformSettings } & Record<string, unknown>> {
    try {
      const response = await apiClient.get('/api/platform/settings');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updatePlatformSettings(payload: Partial<PlatformSettings>): Promise<ApiResponse> {
    try {
      const response = await apiClient.put('/api/admin/settings', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getJobs(): Promise<{ jobs?: JobCircular[] }> {
    try {
      const response = await apiClient.get('/api/admin/jobs');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async saveJob(job: Partial<JobCircular> & { id?: string }): Promise<ApiResponse> {
    try {
      const response = job.id
        ? await apiClient.put(`/api/admin/jobs/${job.id}`, job)
        : await apiClient.post('/api/admin/jobs', job);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteJob(id: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/api/admin/jobs/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getApplications(): Promise<{ applications?: ApplicationRequest[] }> {
    try {
      const response = await apiClient.get('/api/applications');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCandidates(): Promise<{ candidates?: CandidateProfile[] }> {
    try {
      const response = await apiClient.get('/api/admin/candidates');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async impersonateCandidate(candidateId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/admin/impersonate', { candidateId });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async stopImpersonation(): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete('/api/admin/impersonate');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAuditLogs(): Promise<{ logs?: AdminAuditLog[] }> {
    try {
      const response = await apiClient.get('/api/admin/audit-logs');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getWalletTransactions(): Promise<{ transactions?: WalletTransaction[] }> {
    try {
      const response = await apiClient.get('/api/admin/wallet-transactions');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCompanies(): Promise<{ companies?: CompanyProfile[] }> {
    try {
      const response = await apiClient.get('/api/admin/companies');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getSources(): Promise<{ sources?: JobSource[] }> {
    try {
      const response = await apiClient.get('/api/admin/sources');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getPages(): Promise<{ pages?: PageRecord[] }> {
    try {
      const response = await apiClient.get('/api/admin/pages');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getMedia(): Promise<{ media?: MediaItem[] }> {
    try {
      const response = await apiClient.get('/api/admin/media');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCoupons(): Promise<{ coupons?: Coupon[] }> {
    try {
      const response = await apiClient.get('/api/admin/coupons');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getRaffles(): Promise<{ raffles?: RaffleCampaign[] }> {
    try {
      const response = await apiClient.get('/api/admin/raffles');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async uploadApplicantCopy(formData: FormData): Promise<Response> {
    return fetchAdmin('/api/admin/upload-applicant-copy', {
      method: 'POST',
      body: formData,
    });
  },
};
