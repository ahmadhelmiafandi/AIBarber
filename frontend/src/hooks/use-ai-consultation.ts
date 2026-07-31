import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ApiResponse, AiChatMessage, AiConsultationData, AiPreviewData } from '@/types/api';

export function useStartConsultationMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiClient.post<ApiResponse<{ consultation_id: string; status: string }>>(
        '/ai/consultations',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data.data;
    },
  });
}

export function useConsultationQuery(consultationId?: string) {
  return useQuery({
    queryKey: ['ai-consultation', consultationId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AiConsultationData>>(`/ai/consultations/${consultationId}`);
      return res.data.data;
    },
    enabled: !!consultationId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'pending' || data.status === 'processing')) {
        return 2000; // Poll every 2s until completed/failed
      }
      return false;
    },
  });
}

export function useSendAiChatMessageMutation() {
  return useMutation({
    mutationFn: async (messages: AiChatMessage[]) => {
      const res = await apiClient.post<ApiResponse<{ reply: string }>>('/ai/chat', { messages });
      return res.data.data;
    },
  });
}

export function useGeneratePreviewMutation() {
  return useMutation({
    mutationFn: async (payload: { recommendation_id: string; hairstyle_id?: string }) => {
      const res = await apiClient.post<ApiResponse<{ preview_id: string; status: string }>>(
        '/ai/previews',
        payload
      );
      return res.data.data;
    },
  });
}

export function usePreviewQuery(previewId?: string) {
  return useQuery({
    queryKey: ['ai-preview', previewId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AiPreviewData>>(`/ai/previews/${previewId}`);
      return res.data.data;
    },
    enabled: !!previewId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'pending' || data.status === 'processing')) {
        return 2000; // Poll every 2s until completed/failed
      }
      return false;
    },
  });
}
