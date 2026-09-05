'use client';

import { Eye, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import type { Product } from '@/lib/products';

interface RelatedProductsGridProps {
  relatedProducts: Product[];
  onAddToCart: (product: Product) => void;
}

export default function RelatedProductsGrid({
  relatedProducts,
  onAddToCart,
}: RelatedProductsGridProps) {
  if (relatedProducts.length === 0) return null;

  return (
    <div className="pt-16 border-t border-wellness-gray-200">
      <h2 className="text-3xl font-heading font-bold text-wellness-navy mb-8 animate-in fade-in duration-300">
        Related Products
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {relatedProducts.map((related) => (
          <div
            key={related.id}
            className="group block bg-white border border-wellness-gray-200/80 rounded-[24px] overflow-hidden hover:shadow-[0_20px_50px_rgba(10,25,47,0.08)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full relative"
          >
            {/* Card Image Area with Full Size Product Image */}
            <div className="relative aspect-square bg-[#F8F9FA] overflow-hidden shrink-0 border-b border-wellness-gray-100">
              <Image
                src={related.image}
                alt={related.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Type Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${
                    related.type === 'Prescription (Rx)'
                      ? 'bg-red-50/90 backdrop-blur-sm text-red-600 border border-red-100'
                      : 'bg-wellness-navy/90 backdrop-blur-sm text-white'
                  }`}
                >
                  {related.type}
                </span>
              </div>
            </div>

            {/* Card Content Area */}
            <div className="p-6 flex flex-col flex-grow justify-between">
              <div className="space-y-2">
                {/* Category */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-extrabold tracking-widest uppercase text-wellness-green bg-wellness-green/5 px-2.5 py-1 rounded">
                    {related.category}
                  </span>
                </div>

                {/* Product Name */}
                <h4 className="text-base font-heading font-black text-wellness-navy group-hover:text-wellness-green transition-colors line-clamp-1">
                  <Link href={`/products/${related.id}`}>{related.name}</Link>
                </h4>

                {/* Product Description */}
                <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-semibold line-clamp-2">
                  {related.description}
                </p>

                {/* Active Ingredients list */}
                <div className="pt-2 text-[10px] text-wellness-charcoal/40 font-semibold truncate">
                  <span className="font-extrabold uppercase tracking-widest text-wellness-charcoal/30 mr-1.5">
                    Ingredients:
                  </span>
                  {related.ingredients.join(', ')}
                </div>
              </div>

              {/* Price and Action Buttons at Bottom */}
              <div className="mt-5">
                <div className="flex items-baseline justify-between mb-4 border-t border-wellness-gray-100 pt-4">
                  <span className="text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest">
                    Treatment cost
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-wellness-charcoal/40 line-through font-bold">
                      ₹{(related.price * 1.15).toFixed(0)}
                    </span>
                    <span className="text-lg font-black text-wellness-navy">
                      ₹{related.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Visible Dual Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href={`/products/${related.id}`}
                    className="py-3 px-2 border border-wellness-gray-200 hover:border-wellness-navy bg-white hover:bg-wellness-navy hover:text-white text-[10px] font-extrabold uppercase tracking-widest text-wellness-navy text-center rounded-xl transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye size={12} className="stroke-[2.5]" />
                    <span>Details</span>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddToCart(related);
                    }}
                    className="py-3 px-2 bg-wellness-green hover:bg-wellness-navy text-white text-[10px] font-extrabold uppercase tracking-widest text-center rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart size={12} className="stroke-[2.5]" />
                    <span>Quick Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
