export type ProductAnalyticsDTO = {
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
};

export type AnalyticsSummaryDTO = {
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
  productPerformance: ProductAnalyticsDTO[];
};
