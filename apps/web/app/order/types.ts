import { z } from 'zod';

export const orderShippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number required'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  zipCode: z.string().min(6, 'Valid 6-digit postal code required'),
});

export type OrderShippingFormData = z.infer<typeof orderShippingSchema>;
export type ShippingForm = OrderShippingFormData;

export type Step = 'review' | 'shipping' | 'payment';

export interface SavedAddress {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
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

export interface OrderStatusHistoryItem {
  id?: string;
  orderId?: string;
  status: string;
  comment?: string | null;
  createdAt: string;
}

export interface ApiOrderItem {
  productId?: string;
  productName?: string;
  unitPrice?: number;
  quantity?: number;
  product?: {
    id?: string;
    name?: string;
    price?: number;
    image?: string;
    type?: string;
  };
}

export interface ApiOrder {
  id: string;
  orderId?: string;
  paymentId?: string;
  status?: string;
  subtotal?: number;
  totalAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
  payment?: {
    razorpayPaymentId?: string;
    transactionId?: string;
    provider?: string;
  };
  shippingAddress?: {
    fullName?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  items?: ApiOrderItem[];
  statusHistory?: OrderStatusHistoryItem[];
}

export type ApiOrderData = ApiOrder;

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
  status?:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  statusHistory?: OrderStatusHistoryItem[];
  hasRxItems?: boolean;
  rxFileName?: string | null;
}

export interface OrderRecord {
  orderId: string;
  paymentId: string;
  items: unknown[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingForm: OrderShippingFormData;
  date: string;
  status: string;
  hasRxItems?: boolean;
  rxFileName?: string | null;
}
