import { apiClient, fetchWithAuth } from '@/lib/axios';
import { handleApiError } from '@/lib/api-error';
import type { ApiResponse, CandidateDocument } from '@/types';

export const documentsService = {
  async getDocuments(): Promise<{ documents?: CandidateDocument[]; data?: CandidateDocument[] }> {
    try {
      const response = await apiClient.get('/api/documents');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async uploadDocument(formData: FormData): Promise<ApiResponse<CandidateDocument> & { document?: CandidateDocument; fileUrl?: string }> {
    try {
      const res = await fetchWithAuth('/api/candidate/upload-document', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Document upload failed');
      }
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteDocument(id: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete('/api/documents', { data: { id } });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
