import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ApiResponse, Booking, Hairstyle } from '@/types/api';

export interface CustomerFavoriteItem {
  id: string;
  user_id: string;
  hairstyle_id: string;
  hairstyle?: Hairstyle;
}

export interface CustomerMembership {
  id: string;
  user_id: string;
  tier: string;
  points: number;
  valid_until: string;
  status: string;
}

export function useCustomerFavorites() {
  return useQuery({
    queryKey: ['customer-favorites'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<CustomerFavoriteItem[]>>('/favorites');
      return res.data.data;
    },
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hairstyleId: string) => {
      const res = await apiClient.post<ApiResponse<{ is_favorite: boolean }>>('/favorites/toggle', { hairstyle_id: hairstyleId });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-favorites'] });
    },
  });
}

export function useCustomerMembership() {
  return useQuery({
    queryKey: ['customer-membership'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<CustomerMembership>>('/membership');
      return res.data.data;
    },
  });
}

export function useCustomerBookingsHistory() {
  return useQuery({
    queryKey: ['customer-bookings-history'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Booking[]>>('/bookings');
      return res.data.data;
    },
  });
}
