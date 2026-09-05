'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import ProductCatalogFooter from './components/ProductCatalogFooter';
import ProductFilterSidebar from './components/ProductFilterSidebar';
import ProductGrid from './components/ProductGrid';
import ProductHeroBanner from './components/ProductHeroBanner';
import type { ProductClassification, ProductPriceRange, ProductHighlight } from './types';

import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';

  const [categories, setCategories] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [activeType, setActiveType] = useState<ProductClassification>('All');
  const [activePrice, setActivePrice] = useState<ProductPriceRange>('All');
  const [activeHighlight, setActiveHighlight] = useState<ProductHighlight>('All');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const { addToCart } = useCart();

  // Fetch real API products and categories from backend
  const fetchBackendData = useCallback(async () => {
    setIsLoadingApi(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const prodUrl = searchParam.trim()
        ? `${API_BASE}/api/search?q=${encodeURIComponent(searchParam.trim())}`
        : `${API_BASE}/api/products`;

      const [prodsRes, catsRes] = await Promise.all([
        fetch(prodUrl, { signal: AbortSignal.timeout(5000) }),
        fetch(`${API_BASE}/api/categories`, { signal: AbortSignal.timeout(5000) }),
      ]);

      let mappedProducts: Product[] = [];
      if (prodsRes.ok) {
        const json = (await prodsRes.json()) as {
          data?: {
            products?: Array<{
              id: string;
              name: string;
              sellingPrice?: string | number;
              mrp?: string | number;
              startingPrice?: number;
              compareAtPrice?: number;
              stockQty?: number;
              inventoryQty?: number;
              availableQty?: number;
              reservedQty?: number;
              stockStatus?: 'in_stock' | 'out_of_stock' | 'discontinued';
              primaryImage?: string | null;
              categoryName?: string;
              category?: string;
              description?: string;
              shortDescription?: string;
              type?: string;
              isFeatured?: boolean;
              isBestSeller?: boolean;
              isNewest?: boolean;
            }>;
            items?: Array<{
              id: string;
              name: string;
              sellingPrice?: string | number;
              mrp?: string | number;
              startingPrice?: number;
              compareAtPrice?: number;
              stockQty?: number;
              inventoryQty?: number;
              availableQty?: number;
              reservedQty?: number;
              stockStatus?: 'in_stock' | 'out_of_stock' | 'discontinued';
              primaryImage?: string | null;
              categoryName?: string;
              category?: string;
              description?: string;
              shortDescription?: string;
              type?: string;
              isFeatured?: boolean;
              isBestSeller?: boolean;
              isNewest?: boolean;
            }>;
          };
          products?: Array<{
            id: string;
            name: string;
            sellingPrice?: string | number;
            mrp?: string | number;
            startingPrice?: number;
            compareAtPrice?: number;
            stockQty?: number;
            inventoryQty?: number;
            availableQty?: number;
            reservedQty?: number;
            stockStatus?: 'in_stock' | 'out_of_stock' | 'discontinued';
            primaryImage?: string | null;
            categoryName?: string;
            category?: string;
            description?: string;
            shortDescription?: string;
            type?: string;
            isFeatured?: boolean;
            isBestSeller?: boolean;
            isNewest?: boolean;
          }>;
        };

        const rawList = json.data?.products || json.data?.items || json.products || [];
        if (Array.isArray(rawList)) {
          mappedProducts = rawList.map((item) => {
            const spNum =
              typeof item.sellingPrice === 'number'
                ? item.sellingPrice
                : typeof item.sellingPrice === 'string'
                  ? parseFloat(item.sellingPrice)
                  : item.startingPrice || 0;
            const mrpNum =
              typeof item.mrp === 'number'
                ? item.mrp
                : typeof item.mrp === 'string'
                  ? parseFloat(item.mrp)
                  : item.compareAtPrice || spNum;

            const availQty = item.availableQty ?? item.inventoryQty ?? item.stockQty ?? 0;
            const resvQty = item.reservedQty ?? 0;
            const catName = item.categoryName || item.category || 'Therapeutics';

            return {
              id: item.id,
              name: item.name,
              category: catName,
              categoryName: catName,
              type:
                item.type === 'Prescription (Rx)' ? 'Prescription (Rx)' : 'Over-The-Counter (OTC)',
              description: item.description || item.shortDescription || 'No description provided.',
              benefits: [],
              ingredients: [],
              image: item.primaryImage || '/images/cardiostatin.png',
              images: item.primaryImage ? [item.primaryImage] : ['/images/cardiostatin.png'],
              price: spNum,
              originalPrice: mrpNum,
              mrp: mrpNum,
              sellingPrice: spNum,
              stockQty: item.stockQty ?? 0,
              inventoryQty: availQty,
              availableQty: availQty,
              reservedQty: resvQty,
              stockStatus: item.stockStatus ?? 'in_stock',
              isFeatured: item.isFeatured ?? false,
              isBestSeller: item.isBestSeller ?? false,
              isNewest: item.isNewest ?? false,
              tags: [],
            };
          });
        }
      }

      setApiProducts(mappedProducts);

      if (catsRes.ok) {
        const catJson = (await catsRes.json()) as {
          data?: Array<{ id: string; name: string }>;
        };
        if (catJson.data && Array.isArray(catJson.data)) {
          const apiCatNames = catJson.data.map((c) => c.name);
          const merged = Array.from(
            new Set(['All', ...apiCatNames, ...mappedProducts.map((p) => p.category)]),
          );
          setCategories(merged);
        } else {
          const distinct = Array.from(new Set(['All', ...mappedProducts.map((p) => p.category)]));
          setCategories(distinct);
        }
      } else {
        const distinct = Array.from(new Set(['All', ...mappedProducts.map((p) => p.category)]));
        setCategories(distinct);
      }
    } catch (e) {
      console.error('Failed to fetch product catalog from API:', e);
      setApiProducts([]);
      setCategories(['All']);
    } finally {
      setIsLoadingApi(false);
    }
  }, [searchParam]);

  useEffect(() => {
    void fetchBackendData();
  }, [fetchBackendData]);

  useEffect(() => {
    setProductsList(apiProducts);
  }, [apiProducts]);

  // Sync search query from URL params
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Sync category filter & search query & price/type filters
  useEffect(() => {
    setActiveCategory(categoryParam);

    let temp = productsList;
    if (categoryParam !== 'All') {
      temp = temp.filter((p) => p.category === categoryParam);
    }

    if (activeType === 'Prescription') {
      temp = temp.filter((p) => p.type === 'Prescription (Rx)');
    } else if (activeType === 'OTC') {
      temp = temp.filter((p) => p.type === 'Over-The-Counter (OTC)');
    }

    if (activePrice === 'under-2000') {
      temp = temp.filter((p) => p.price < 2000);
    } else if (activePrice === '2000-5000') {
      temp = temp.filter((p) => p.price >= 2000 && p.price <= 5000);
    } else if (activePrice === 'above-5000') {
      temp = temp.filter((p) => p.price > 5000);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      temp = temp.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.ingredients.some((ing) => ing.toLowerCase().includes(query)),
      );
    }

    // Apply active highlight sorting/filtering
    if (activeHighlight === 'new') {
      const newestOnly = temp.filter((p) => p.isNewest);
      temp = newestOnly.length > 0 ? newestOnly : [...temp].reverse();
    } else if (activeHighlight === 'best') {
      const bestsellersOnly = temp.filter((p) => p.isBestSeller);
      temp = bestsellersOnly.length > 0 ? bestsellersOnly : temp;
    } else if (activeHighlight === 'featured') {
      const featuredOnly = temp.filter((p) => p.isFeatured);
      temp = featuredOnly.length > 0 ? featuredOnly : temp;
    } else if (activeHighlight === 'discount') {
      temp = temp.filter((p) => p.price < 4000 || (p.mrp && p.price && p.mrp > p.price));
    }

    setFilteredProducts(temp);
  }, [categoryParam, searchQuery, productsList, activeType, activePrice, activeHighlight]);

  const handleCategoryChange = (category: string) => {
    router.push(
      `/products${category === 'All' ? '' : `?category=${encodeURIComponent(category)}`}`,
      { scroll: false },
    );
  };

  const handleResetFilters = () => {
    setActiveCategory('All');
    setActiveType('All');
    setActivePrice('All');
    setActiveHighlight('All');
    setSearchQuery('');
    router.push('/products', { scroll: false });
  };

  const getCategoryCount = (category: string) => {
    if (category === 'All') return productsList.length;
    return productsList.filter((p) => p.category === category).length;
  };

  const hasActiveFilters =
    activeCategory !== 'All' ||
    activeType !== 'All' ||
    activePrice !== 'All' ||
    activeHighlight !== 'All' ||
    searchQuery.trim() !== '';

  const handleAddToCart = (product: Product, quantity = 1) => {
    void addToCart(product, quantity);
  };

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen">
      {/* 1. Hero Header Banner */}
      <ProductHeroBanner activeCategory={activeCategory} />

      {/* 2. Main Overlapping Content Overlay */}
      <div className="relative z-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 pb-24">
        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-[0_20px_60px_rgba(12,27,51,0.06)] p-6 sm:p-10 border border-wellness-gray-200/50">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Sidebar Filter Section */}
            <ProductFilterSidebar
              categories={categories}
              activeCategory={activeCategory}
              activeType={activeType}
              activePrice={activePrice}
              activeHighlight={activeHighlight}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
              onSelectCategory={handleCategoryChange}
              onSelectType={setActiveType}
              onSelectPrice={setActivePrice}
              onSelectHighlight={setActiveHighlight}
              getCategoryCount={getCategoryCount}
            />

            {/* Right Content Section */}
            <ProductGrid
              products={filteredProducts}
              isLoading={isLoadingApi}
              totalApiProductsCount={apiProducts.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        {/* Newsletter & Trust Badges */}
        <ProductCatalogFooter />
      </div>
    </div>
  );
}
