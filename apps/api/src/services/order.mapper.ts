import type {
  OrderDTO,
  OrderItemDTO,
  OrderShippingAddressDTO,
  PaymentDTO,
  InvoiceDTO,
  OrderStatusHistoryDTO,
} from '@wellness/contracts';

type RawOrderInput = {
  id: string;
  userId: string | null;
  status: string;
  trackingNumber: string | null;
  price: number | null;
  subtotal: number | null;
  discountAmount: number | null;
  shippingAmount: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  createdAt: Date;
  updatedAt: Date;
  address?:
    | {
        id: string;
        houseNumber: string | null;
        street: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
      }
    | null
    | undefined;
  items?:
    | Array<{
        id: string;
        orderId: string;
        productId: string;
        productName: string | null;
        unitPrice: number | null;
        quantity: number;
        totalAmount: number | null;
      }>
    | undefined;
  payment?:
    | {
        id: string;
        orderId: string;
        transactionId: string | null;
        provider: string | null;
        amount: number | null;
        currency: string | null;
        status: string;
        paymentMethod: string | null;
        createdAt: Date;
      }
    | null
    | undefined;
  invoice?:
    | {
        id: string;
        orderId: string | null;
        paymentId: string | null;
        createdAt: Date;
      }
    | null
    | undefined;
  statusHistory?:
    | Array<{
        id: string;
        orderId: string;
        status: string | null;
        comment: string | null;
        createdAt: Date;
      }>
    | undefined;
};

export function toOrderDTO(raw: RawOrderInput): OrderDTO {
  const addressDTO: OrderShippingAddressDTO | null = raw.address
    ? {
        id: raw.address.id,
        street: raw.address.street || '',
        city: raw.address.city || '',
        state: raw.address.state || '',
        pincode: raw.address.pincode || '',
        houseNumber: raw.address.houseNumber,
        country: raw.address.country,
      }
    : null;

  const itemsDTO: OrderItemDTO[] = (raw.items || []).map((item) => ({
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    unitPrice: item.unitPrice ?? 0,
    quantity: item.quantity,
    totalAmount: item.totalAmount ?? (item.unitPrice ?? 0) * item.quantity,
  }));

  const paymentDTO: PaymentDTO | null = raw.payment
    ? {
        id: raw.payment.id,
        orderId: raw.payment.orderId,
        transactionId: raw.payment.transactionId,
        provider: raw.payment.provider || 'razorpay',
        amount: raw.payment.amount ?? raw.totalAmount ?? 0,
        currency: raw.payment.currency || 'INR',
        status: raw.payment.status as PaymentDTO['status'],
        paymentMethod: raw.payment.paymentMethod,
        createdAt: raw.payment.createdAt.toISOString(),
      }
    : null;

  const invoiceDTO: InvoiceDTO | null = raw.invoice
    ? {
        id: raw.invoice.id,
        orderId: raw.invoice.orderId,
        paymentId: raw.invoice.paymentId,
        createdAt: raw.invoice.createdAt.toISOString(),
      }
    : null;

  const statusHistoryDTO: OrderStatusHistoryDTO[] = (raw.statusHistory || []).map((sh) => ({
    id: sh.id,
    orderId: sh.orderId,
    status: sh.status || 'pending',
    comment: sh.comment,
    createdAt: sh.createdAt.toISOString(),
  }));

  return {
    id: raw.id,
    userId: raw.userId,
    status: raw.status,
    trackingNumber: raw.trackingNumber,
    price: raw.price,
    subtotal: raw.subtotal,
    discountAmount: raw.discountAmount,
    shippingAmount: raw.shippingAmount,
    taxAmount: raw.taxAmount,
    totalAmount: raw.totalAmount,
    shippingAddress: addressDTO,
    items: itemsDTO,
    payment: paymentDTO,
    invoice: invoiceDTO,
    statusHistory: statusHistoryDTO,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}
