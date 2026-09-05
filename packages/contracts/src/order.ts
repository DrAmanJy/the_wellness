export type OrderShippingAddressDTO = {
  id?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  houseNumber?: string | null;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string | null;
};

export type OrderItemDTO = {
  id?: string;
  orderId?: string;
  productId: string;
  productName?: string | null;
  unitPrice: number;
  quantity: number;
  totalAmount?: number | null;
};

export type PaymentDTO = {
  id?: string;
  orderId?: string;
  transactionId?: string | null;
  provider: string;
  amount: number;
  currency?: string | null;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod?: string | null;
  createdAt?: string;
};

export type InvoiceDTO = {
  id: string;
  orderId?: string | null;
  paymentId?: string | null;
  createdAt: string;
};

export type CreateOrderDTO = {
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    houseNumber?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  payment: {
    provider: string;
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    paymentMethod?: string;
  };
  items: Array<{
    productId: string;
    productName?: string;
    unitPrice: number;
    quantity: number;
  }>;
  subtotal?: number;
  shippingAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
};

export type OrderStatusHistoryDTO = {
  id: string;
  orderId: string;
  status: string;
  comment?: string | null;
  createdAt: string;
};

export type OrderDTO = {
  id: string;
  userId?: string | null;
  status: string;
  trackingNumber?: string | null;
  price?: number | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  shippingAmount?: number | null;
  taxAmount?: number | null;
  totalAmount?: number | null;
  shippingAddress?: OrderShippingAddressDTO | null;
  items: OrderItemDTO[];
  payment?: PaymentDTO | null;
  invoice?: InvoiceDTO | null;
  statusHistory?: OrderStatusHistoryDTO[];
  createdAt: string;
  updatedAt: string;
};
