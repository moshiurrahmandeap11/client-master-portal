import { apiClient } from '@/lib/axios';
import { handleApiError } from '@/lib/api-error';
import type { ApiResponse, EligibilityResult, JobCircular } from '@/types';

export interface JobsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  q?: string;
}

export const jobsService = {
  async getJobs(params: JobsQueryParams = {}): Promise<{ jobs: JobCircular[]; total?: number; totalPages?: number }> {
    try {
      const response = await apiClient.get('/api/jobs', { params });
      const resData = response.data;
      const rawJobs = Array.isArray(resData?.jobs)
        ? resData.jobs
        : Array.isArray(resData?.data)
        ? resData.data
        : [];
      return {
        jobs: rawJobs,
        total: resData?.total ?? resData?.meta?.total ?? rawJobs.length,
        totalPages: resData?.totalPages ?? resData?.meta?.totalPages ?? 1,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAllPublicJobs(): Promise<JobCircular[]> {
    const jobs: JobCircular[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const data = await jobsService.getJobs({ limit: 100, page });
      if (!Array.isArray(data.jobs)) throw new Error('Invalid jobs response');
      jobs.push(...data.jobs);
      totalPages = data.totalPages || 1;
      page++;
    } while (page <= totalPages);
    return jobs;
  },

  async getJobById(id: string): Promise<{ job?: JobCircular; data?: JobCircular } & ApiResponse<JobCircular>> {
    try {
      const response = await apiClient.get(`/api/jobs/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async searchJobs(params: Record<string, string | number | boolean | undefined>): Promise<{ jobs: JobCircular[]; total?: number }> {
    try {
      const response = await apiClient.get('/api/jobs/search', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getFeedJobs(feedType: string, params: Record<string, string | number | undefined> = {}): Promise<{ jobs: JobCircular[] }> {
    try {
      const slug = feedType.replace(/_/g, '-');
      const response = await apiClient.get(`/api/jobs/${slug}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getDailyJobs(date: string): Promise<{ jobs: JobCircular[]; date?: string }> {
    try {
      const response = await apiClient.get(`/api/jobs/daily/${date}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getDeadlineStatus(jobId: string): Promise<Record<string, unknown>> {
    try {
      const response = await apiClient.get(`/api/jobs/${jobId}/deadline-status`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async checkEligibility(payload: { jobId: string; positionId?: string }): Promise<EligibilityResult> {
    try {
      const response = await apiClient.post('/api/eligibility/check', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async reportJob(payload: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/jobs/report', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async subscribeJobAlerts(payload: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/job-alerts', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getRecommendations(): Promise<{ recommendations?: JobCircular[]; jobs?: JobCircular[] }> {
    try {
      const response = await apiClient.get('/api/user/recommendations');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async submitRecommendationFeedback(payload: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/user/recommendations/feedback', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const fetchPublicJobs = (): Promise<JobCircular[]> => jobsService.getAllPublicJobs();
