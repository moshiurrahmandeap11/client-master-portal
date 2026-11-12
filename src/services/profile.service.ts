import { apiClient } from '@/lib/axios';
import { handleApiError } from '@/lib/api-error';
import type { ApiResponse, CandidateProfile, ExperienceRecord } from '@/types';

export const profileService = {
  async getProfile(): Promise<{ profile?: CandidateProfile; user?: CandidateProfile; data?: CandidateProfile }> {
    try {
      const response = await apiClient.get('/api/profile');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateProfile(payload: Partial<CandidateProfile> & Record<string, unknown>): Promise<ApiResponse<CandidateProfile> & { profile?: CandidateProfile }> {
    try {
      const response = await apiClient.put('/api/profile', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async patchProfile(payload: Partial<CandidateProfile> & Record<string, unknown>): Promise<ApiResponse<CandidateProfile> & { profile?: CandidateProfile }> {
    try {
      const response = await apiClient.patch('/api/profile', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getSavedJobs(): Promise<{ savedJobs?: string[]; jobs?: unknown[] }> {
    try {
      const response = await apiClient.get('/api/candidate/saved-jobs');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async toggleSaveJob(jobId: string, action?: 'save' | 'unsave'): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/candidate/saved-jobs', { jobId, action });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getExperience(): Promise<{ experience?: ExperienceRecord[] }> {
    try {
      const response = await apiClient.get('/api/user/experience');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async addExperience(payload: Partial<ExperienceRecord>): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/user/experience', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteExperience(id: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/api/user/experience/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getSkills(): Promise<{ skills?: unknown[] }> {
    try {
      const response = await apiClient.get('/api/user/skills');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async addSkill(payload: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/user/skills', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteSkill(id: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/api/user/skills/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async saveCareerPreferences(payload: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const response = await apiClient.put('/api/user/career-preferences', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
