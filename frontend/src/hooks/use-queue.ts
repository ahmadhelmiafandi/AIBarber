import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ApiResponse, Queue } from '@/types/api';

export function useActiveQueue() {
  return useQuery({
    queryKey: ['active-queue'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Queue | null>>('/queues/active');
      return res.data.data;
    },
  });
}

export function useQueueDetails(queueId?: string) {
  return useQuery({
    queryKey: ['queue', queueId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Queue>>(`/queues/${queueId}`);
      return res.data.data;
    },
    enabled: !!queueId,
  });
}

export function useBranchQueues(branchId?: string, date?: string) {
  return useQuery({
    queryKey: ['branch-queues', branchId, date],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (date) params.date = date;
      const res = await apiClient.get<ApiResponse<Queue[]>>(`/branches/${branchId}/queues`, { params });
      return res.data.data;
    },
    enabled: !!branchId,
  });
}

export function useCheckInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (queueId: string) => {
      const res = await apiClient.post<ApiResponse<Queue>>(`/queues/${queueId}/check-in`);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['queue', data.queue_id] });
      queryClient.invalidateQueries({ queryKey: ['active-queue'] });
      queryClient.invalidateQueries({ queryKey: ['branch-queues'] });
    },
  });
}

export function useCallCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (queueId: string) => {
      const res = await apiClient.post<ApiResponse<Queue>>(`/queues/${queueId}/call`);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['queue', data.queue_id] });
      queryClient.invalidateQueries({ queryKey: ['branch-queues'] });
    },
  });
}

export function useStartServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (queueId: string) => {
      const res = await apiClient.post<ApiResponse<Queue>>(`/queues/${queueId}/start-service`);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['queue', data.queue_id] });
      queryClient.invalidateQueries({ queryKey: ['branch-queues'] });
    },
  });
}

export function useCompleteServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (queueId: string) => {
      const res = await apiClient.post<ApiResponse<Queue>>(`/queues/${queueId}/complete-service`);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['queue', data.queue_id] });
      queryClient.invalidateQueries({ queryKey: ['branch-queues'] });
    },
  });
}
