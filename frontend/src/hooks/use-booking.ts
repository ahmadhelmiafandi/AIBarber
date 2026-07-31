import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ApiResponse, Barber, Booking, BookingSlot, Branch, Service } from '@/types/api';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Branch[]>>('/branches');
      return res.data.data;
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Service[]>>('/services');
      return res.data.data;
    },
  });
}

export function useBarbers(branchId?: string) {
  return useQuery({
    queryKey: ['barbers', branchId],
    queryFn: async () => {
      const params = branchId ? { branch_id: branchId } : {};
      const res = await apiClient.get<ApiResponse<Barber[]>>('/barbers', { params });
      return res.data.data;
    },
    enabled: !!branchId,
  });
}

export function useBookingSlots(branchId?: string, bookingDate?: string, serviceId?: string, barberId?: string) {
  return useQuery({
    queryKey: ['booking-slots', branchId, bookingDate, serviceId, barberId],
    queryFn: async () => {
      const params: Record<string, string> = {
        branch_id: branchId!,
        booking_date: bookingDate!,
        service_id: serviceId!,
      };
      if (barberId) {
        params.barber_id = barberId;
      }
      const res = await apiClient.get<ApiResponse<{ available_slots: (string | BookingSlot)[] }>>('/booking-slots', { params });
      const rawSlots = res.data.data?.available_slots || [];
      return rawSlots.map((s) => (typeof s === 'string' ? { time: s, available: true } : s));
    },
    enabled: !!(branchId && bookingDate && serviceId),
  });
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (payload: {
      branch_id: string;
      service_id: string;
      booking_date: string;
      booking_time: string;
      barber_id?: string;
    }) => {
      const res = await apiClient.post<ApiResponse<Booking>>('/bookings', payload);
      return res.data.data;
    },
  });
}
