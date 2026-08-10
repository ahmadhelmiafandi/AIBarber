import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ApiResponse, Barber, Hairstyle, User, Booking, Service, PaginationMeta } from '@/types/api';

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

export interface FetchQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  branchId?: string;
  date?: string;
}

// 1. Admin Customers Hook
export function useAdminCustomers(params: FetchQueryParams = {}) {
  const { page = 1, perPage = 10, search = '', status = '' } = params;
  return useQuery({
    queryKey: ['admin-customers', page, perPage, search, status],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User[]>>('/admin/customers', {
        params: { page, per_page: perPage, search, status },
      });
      return {
        data: res.data.data || [],
        meta: (res.data.meta as PaginationMeta) || {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: (res.data.data || []).length,
          from: 1,
          to: (res.data.data || []).length,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; phone?: string; status?: string }) => {
      const res = await apiClient.post<ApiResponse<User>>('/admin/customers', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    },
  });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { name?: string; email?: string; phone?: string; status?: string } }) => {
      const res = await apiClient.put<ApiResponse<User>>(`/admin/customers/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    },
  });
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<null>>(`/admin/customers/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    },
  });
}

// 2. Admin Bookings Hook
export function useAdminBookings(params: FetchQueryParams = {}) {
  const { page = 1, perPage = 10, search = '', status = '', branchId = '', date = '' } = params;
  return useQuery({
    queryKey: ['admin-bookings', page, perPage, search, status, branchId, date],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Booking[]>>('/bookings', {
        params: { page, per_page: perPage, search, status, branch_id: branchId, date },
      });
      return {
        data: res.data.data || [],
        meta: (res.data.meta as PaginationMeta) || {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: (res.data.data || []).length,
          from: 1,
          to: (res.data.data || []).length,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

// 3. Admin Barbers Hook
export function useAdminBarbers(params: FetchQueryParams = {}) {
  const { page = 1, perPage = 10, search = '', branchId = '' } = params;
  return useQuery({
    queryKey: ['admin-barbers', page, perPage, search, branchId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Barber[]>>('/barbers', {
        params: { page, per_page: perPage, search, branch_id: branchId },
      });
      return {
        data: res.data.data || [],
        meta: (res.data.meta as PaginationMeta) || {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: (res.data.data || []).length,
          from: 1,
          to: (res.data.data || []).length,
        },
      };
    },
    placeholderData: keepPreviousData,
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

// 4. Admin Services Hook
export function useAdminServices(params: FetchQueryParams = {}) {
  const { page = 1, perPage = 10, search = '' } = params;
  return useQuery({
    queryKey: ['admin-services', page, perPage, search],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Service[]>>('/services', {
        params: { page, per_page: perPage, search },
      });
      return {
        data: res.data.data || [],
        meta: (res.data.meta as PaginationMeta) || {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: (res.data.data || []).length,
          from: 1,
          to: (res.data.data || []).length,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; price: number; estimated_duration_minutes: number; description?: string; is_active?: boolean }) => {
      const res = await apiClient.post<ApiResponse<Service>>('/services', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });
}

export function useUpdateServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { name?: string; price?: number; estimated_duration_minutes?: number; description?: string; is_active?: boolean } }) => {
      const res = await apiClient.put<ApiResponse<Service>>(`/services/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });
}

export function useDeleteServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<null>>(`/services/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });
}

// 5. Admin Hairstyles Hook
export function useAdminHairstyles(params: FetchQueryParams = {}) {
  const { page = 1, perPage = 10, search = '' } = params;
  return useQuery({
    queryKey: ['admin-hairstyles', page, perPage, search],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Hairstyle[]>>('/hairstyles', {
        params: { page, per_page: perPage, search },
      });
      return {
        data: res.data.data || [],
        meta: (res.data.meta as PaginationMeta) || {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: (res.data.data || []).length,
          from: 1,
          to: (res.data.data || []).length,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

// 4. Admin AI Rules & Prompts
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
