import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ApiResponse, Barber, Hairstyle } from '@/types/api';

export interface AiRuleItem {
  id: string;
  rule_name: string;
  face_shape?: string;
  hair_texture?: string;
  score_modifier: number;
  hairstyle?: Hairstyle;
}

export interface AiPromptItem {
  id: string;
  key: string;
  name: string;
  prompt_text: string;
  is_active: boolean;
}

export function useAdminBarbers() {
  return useQuery({
    queryKey: ['admin-barbers'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Barber[]>>('/barbers');
      return res.data.data;
    },
  });
}

export function useCreateBarberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { user_id: string; branch_id: string; specialization?: string }) => {
      const res = await apiClient.post<ApiResponse<Barber>>('/barbers', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-barbers'] });
    },
  });
}

export function useAdminAiRules() {
  return useQuery({
    queryKey: ['admin-ai-rules'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ rules: AiRuleItem[] }>>('/admin/ai-rules');
      return res.data.data?.rules || [];
    },
  });
}

export function useCreateAiRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rule_name: string; face_shape?: string; score_modifier: number }) => {
      const res = await apiClient.post<ApiResponse<AiRuleItem>>('/admin/ai-rules', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-rules'] });
    },
  });
}

export function useAdminAiPrompts() {
  return useQuery({
    queryKey: ['admin-ai-prompts'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AiPromptItem[]>>('/admin/ai-prompts');
      return res.data.data;
    },
  });
}

export function useSaveAiPromptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { key: string; name: string; prompt_text: string }) => {
      const res = await apiClient.post<ApiResponse<AiPromptItem>>('/admin/ai-prompts', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-prompts'] });
    },
  });
}
