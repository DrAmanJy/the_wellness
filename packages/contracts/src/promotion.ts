export type PromotionDTO = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  targetUrl: string;
  discountText?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};
