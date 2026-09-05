export type AdminTab =
  'analytics' | 'products' | 'inventory' | 'categories' | 'queries' | 'orders' | 'promotions';

export interface ContactQuery {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  inquiryType: string;
  message: string;
  date: string;
  status: string;
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
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  hasRxItems?: boolean;
  rxFileName?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface PromotionItem {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  discountText?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface ApiAnalyticsSummary {
  totalRevenue: number;
  confirmedSales: number;
  pendingRevenue: number;
  averageOrderValue: number;
  totalOrdersCount: number;
  confirmedOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  salesTrend7Days: Array<{ date: string; revenue: number }>;
  categoryDistribution: Array<{ category: string; sales: number }>;
  productPerformance: Array<{
    id: string;
    name: string;
    category: string;
    sellingPrice?: number;
    unitsSold: number;
    stockQty: number;
    stockStatus?: string;
    revenue: number;
    orderCount?: number;
    avgUnitsPerOrder?: number;
    revenueSharePercentage?: number;
    growthRate: string;
    isPositive: boolean;
  }>;
}

export interface ApiProductDetailAnalytics {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  unitsSold: number;
  stockQty: number;
  stockStatus: string;
  revenue: number;
  orderCount: number;
  avgUnitsPerOrder: number;
  revenueSharePercentage: number;
  growthRate: string;
  isPositive: boolean;
  salesTrend7Days?: Array<{ date: string; unitsSold: number; revenue: number }>;
}

export interface NewProductFormState {
  name: string;
  category: string;
  type: string;
  mrp: string;
  sellingPrice: string;
  stockQty: string;
  availableQty: string;
  reservedQty: string;
  inventoryQty: string;
  stockStatus: 'in_stock' | 'out_of_stock' | 'discontinued';
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewest: boolean;
  description: string;
  benefits: string;
  ingredients: string;
  image: string;
  tags: string;
}

export interface QuickUpdateProductPayload {
  stockStatus?: 'in_stock' | 'out_of_stock' | 'discontinued';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewest?: boolean;
}
