export type Role = 'customer' | 'provider' | 'admin';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentMethod = 'pay_on_work_cash' | 'pay_on_work_upi';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  basePrice: number;
}

export interface ServiceBooking {
  id: string;
  customerId: string;
  providerId?: string;
  categoryId: string;
  status: BookingStatus;
  scheduledAt: string;
  address: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}
