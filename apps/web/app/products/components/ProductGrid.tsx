'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Search, X } from 'lucide-react';
import React, { useRef } from 'react';

import ProductCard from './ProductCard';

import type { Product } from '@/lib/products';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  totalApiProductsCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export default function ProductGrid({
  products,
  isLoading,
  totalApiProductsCount,
  searchQuery,
  onSearchChange,
  onAddToCart,
}: ProductGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      );
    }
  }, [products]);

  return (
    <div className="flex-grow flex flex-col">
      {/* Dynamic Search & Items Summary */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-wellness-gray-200 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-wellness-charcoal/40">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
            placeholder="Search products, ingredients, symptoms..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-wellness-gray-200 bg-wellness-white text-xs font-semibold focus:outline-none focus:border-wellness-green focus:ring-1 focus:ring-wellness-green transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-wellness-charcoal/40 hover:text-wellness-navy"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-[10px] font-bold text-wellness-charcoal/40 uppercase tracking-widest bg-wellness-gray-100 px-3 py-1.5 rounded-lg border border-wellness-gray-200/50">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-wellness-navy font-semibold bg-white rounded-2xl border border-wellness-gray-200 shadow-sm flex flex-col items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-wellness-navy border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm font-bold">Loading product catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center text-wellness-charcoal/50 bg-white rounded-2xl border border-wellness-gray-200 shadow-sm flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-full bg-wellness-gray-100 flex items-center justify-center mb-4 text-wellness-charcoal/30">
            <Search size={24} />
          </div>
          <p className="text-base font-bold text-wellness-navy">No products found</p>
          <p className="text-xs text-wellness-charcoal/60 mt-1 max-w-sm">
            {totalApiProductsCount === 0
              ? 'No products currently exist in the backend database. Add products in the Admin Portal.'
              : 'Try adjusting your search criteria or resetting the category filters.'}
          </p>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
