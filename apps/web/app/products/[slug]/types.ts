export interface ApiProductListItem {
  id: string;
  name: string;
  categoryName?: string;
  category?: string;
  type?: string;
  description?: string;
  shortDescription?: string;
  features?: string[];
  benefits?: string[];
  ingredients?: string[];
  primaryImage?: string;
  image?: string;
  images?: Array<string | { url?: string }>;
  sellingPrice?: number | string;
  startingPrice?: number;
  mrp?: number | string;
  compareAtPrice?: number;
  availableQty?: number;
  inventoryQty?: number;
  stockQty?: number;
  tags?: string[];
  requiresPrescription?: boolean;
  dosage?: string;
}
