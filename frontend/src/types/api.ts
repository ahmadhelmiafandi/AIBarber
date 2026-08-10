export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta | Record<string, unknown> | null;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface BarberProfile {
  id: string;
  branch_id: string;
  is_active: boolean;
}

export interface MembershipInfo {
  id?: string;
  tier: string;
  points?: number;
  valid_until?: string | null;
  status?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'barber' | 'receptionist' | 'admin' | 'owner';
  status: 'active' | 'suspended' | 'inactive';
  email_verified_at?: string | null;
  notification_preferences?: Record<string, boolean> | null;
  barberProfile?: BarberProfile | null;
  membership?: MembershipInfo | null;
  created_at?: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  google_maps_url?: string | null;
  opening_hours?: Record<string, { is_open?: boolean; open?: string; close?: string }> | null;
  is_active: boolean;
  created_at?: string;
}

export interface Service {
  id: string;
  name: string;
  estimated_duration_minutes: number;
  price: number;
  is_active: boolean;
}

export interface Barber {
  id: string;
  user_id: string;
  branch_id: string;
  specialization?: string;
  rating?: number;
  status?: string;
  is_active: boolean;
  user?: User;
  branch?: Branch;
}

export interface Hairstyle {
  id: string;
  name: string;
  category?: string;
  maintenance_level?: string;
  difficulty?: string;
  description?: string;
  price?: number;
  is_active?: boolean;
}

export interface Booking {
  id: string;
  booking_code: string;
  customer_id: string;
  barber_id: string;
  branch_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  created_at?: string;
  customer?: User;
  service?: Service;
  barber?: Barber;
  branch?: Branch;
  queue?: Queue;
}

export interface Queue {
  queue_id: string;
  booking_id: string;
  branch_id: string;
  booking_date?: string | null;
  queue_number: number;
  queue_code: string;
  status: 'waiting' | 'checked_in' | 'called' | 'on_service' | 'completed' | 'skipped' | 'cancelled';
  version: number;
  queue_position: number | null;
  customers_ahead: number | null;
  estimated_start_time: string | null;
  estimated_finish_time: string | null;
  actual_start_time: string | null;
  actual_finish_time: string | null;
  created_at?: string;
  booking?: Booking;
}

export interface BookingSlot {
  time: string;
  available: boolean;
}

export interface NotificationData {
  type?: string;
  message?: string;
  queue_id?: string;
  queue_number?: number;
  booking_id?: string;
  booking_code?: string;
  window?: string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
}

export interface StaffQueueEventPayload {
  event: string;
  queue_id: string;
  branch_id: string;
  version: number;
  status: Queue['status'];
  queue_number: number;
  queue_code: string;
  estimated_start_time: string | null;
  estimated_finish_time: string | null;
  customer_name?: string;
}

export interface CustomerQueueEventPayload {
  event: string;
  queue_id: string;
  version: number;
  status: Queue['status'];
  message?: string;
  estimated_start_time: string | null;
}

export interface PublicQueueEventPayload {
  event: string;
  queue_code: string;
  queue_number: number;
  status: Queue['status'];
  version: number;
}

export interface FaceProfile {
  id?: string;
  face_shape: string;
  hairline?: string;
  hair_texture: string;
  hair_density: string;
}

export interface AiRecommendationItemData {
  rank: number;
  score: number;
  reason: string;
  hairstyle: Service | { id: string; name: string; price: number; estimated_duration_minutes?: number };
}

export interface AiConsultationData {
  consultation_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string | null;
  face_profile?: FaceProfile | null;
  recommendations?: AiRecommendationItemData[];
}

export interface AiPreviewData {
  preview_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string | null;
  generated_image_url?: string | null;
  similarity_score?: number | null;
  threshold_used?: number | null;
  identity_verified?: boolean;
  metric?: string | null;
  verifier_version?: string | null;
}

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
