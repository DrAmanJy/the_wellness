import { z } from 'zod';

export type AccountTab = 'orders' | 'addresses' | 'profile';

export const accountAddressSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(255, 'Full name is too long'),
  email: z.string().trim().min(1, 'Email address is required').email('Invalid email address'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^[+0-9\s-()]+$/, 'Invalid phone number format'),
  address: z.string().trim().min(1, 'Street address is required'),
  city: z.string().trim().min(1, 'City is required'),
  zipCode: z
    .string()
    .trim()
    .min(1, 'ZIP/Pincode is required')
    .regex(/^[A-Za-z0-9\s-]+$/, 'Invalid ZIP code format'),
});

export type AccountAddressFormData = z.infer<typeof accountAddressSchema>;

export interface ApiOrderItem {
  productId: string;
  productName?: string;
  unitPrice: number;
  quantity: number;
}

export interface ApiOrderDTO {
  id: string;
  userId?: string | null;
  status: string;
  trackingNumber?: string | null;
  price?: number | null;
  subtotal?: number | null;
  shippingAmount?: number | null;
  taxAmount?: number | null;
  totalAmount?: number | null;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    email?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
  items?: ApiOrderItem[];
  payment?: {
    provider?: string;
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    amount?: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    type: string;
  };
  quantity: number;
}

export interface OrderData {
  orderId: string;
  paymentId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingForm: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  date: string;
  status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  hasRxItems?: boolean;
  rxFileName?: string | null;
}

export interface Address {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  isDefault?: boolean;
}
