export type ProductClassification = 'All' | 'Prescription' | 'OTC';

export type ProductPriceRange = 'All' | 'under-2000' | '2000-5000' | 'above-5000';

export type ProductHighlight = 'All' | 'new' | 'best' | 'featured' | 'discount';

export interface ProductFilterState {
  activeCategory: string;
  activeType: ProductClassification;
  activePrice: ProductPriceRange;
  activeHighlight: ProductHighlight;
  searchQuery: string;
}
