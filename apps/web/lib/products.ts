export type Product = {
  id: string;
  name: string;
  category: string;
  categoryName?: string;
  type: 'Prescription (Rx)' | 'Over-The-Counter (OTC)';
  description: string;
  benefits: string[];
  ingredients: string[];
  image: string;
  images?: string[];
  price: number;
  mrp?: number;
  sellingPrice?: number;
  originalPrice?: number;
  stockQty?: number;
  inventoryQty?: number;
  availableQty?: number;
  reservedQty?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'discontinued';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewest?: boolean;
  tags?: string[];
};

export const products: Product[] = [];

export const getProductById = (id: string) => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (category: string) => {
  if (!category || category === 'All') return products;
  return products.filter((p) => p.category === category);
};

export const getAllCategories = () => {
  const categories = new Set(products.map((p) => p.category));
  return ['All', ...Array.from(categories)];
};
