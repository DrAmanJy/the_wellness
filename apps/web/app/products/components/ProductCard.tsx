'use client';

import { Eye, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import type { Product } from '@/lib/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const sp = product.price;
  const mrp = product.mrp || product.originalPrice || Math.round(sp * 1.25);
  const discountPercent = mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;
  const stock = product.availableQty ?? product.inventoryQty ?? product.stockQty ?? 0;
  const isOutOfStock = stock <= 0 || product.stockStatus === 'out_of_stock';
  const isLowStock = !isOutOfStock && stock <= 5;

  return (
    <div
      className={`group block bg-white border rounded-[24px] overflow-hidden transition-all duration-500 flex flex-col h-full relative ${
        isOutOfStock
          ? 'border-red-200/80 opacity-80'
          : 'border-wellness-gray-200/80 hover:shadow-[0_20px_50px_rgba(10,25,47,0.08)] hover:-translate-y-1.5'
      }`}
    >
      {/* Card Image Area with Full Size Product Image */}
      <div className="relative aspect-square bg-[#F8F9FA] overflow-hidden shrink-0 border-b border-wellness-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-700 ${
            isOutOfStock ? 'grayscale-[30%]' : 'group-hover:scale-105'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Type Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span
            className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${
              product.type === 'Prescription (Rx)'
                ? 'bg-red-50/90 backdrop-blur-sm text-red-600 border border-red-100'
                : 'bg-wellness-navy/90 backdrop-blur-sm text-white'
            }`}
          >
            {product.type}
          </span>
        </div>

        {/* Stock & Highlight Badges on Image */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1.5">
          {product.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-wellness-green text-wellness-navy shadow-sm">
              Featured
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
              Bestseller
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-600 backdrop-blur-sm text-white shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 backdrop-blur-sm text-white shadow-sm">
              Low Stock: {stock} left
            </span>
          ) : discountPercent > 0 ? (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600/90 backdrop-blur-sm text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div className="space-y-2">
          {/* Category */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-extrabold tracking-widest uppercase text-wellness-green bg-wellness-green/5 px-2.5 py-1 rounded">
              {product.category}
            </span>
          </div>

          {/* Product Name */}
          <h4 className="text-base font-heading font-black text-wellness-navy group-hover:text-wellness-green transition-colors line-clamp-1">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </h4>

          {/* Product Description */}
          <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-semibold line-clamp-2">
            {product.description}
          </p>

          {/* Active Ingredients list */}
          <div className="pt-2 text-[10px] text-wellness-charcoal/40 font-semibold truncate">
            <span className="font-extrabold uppercase tracking-widest text-wellness-charcoal/30 mr-1.5">
              Ingredients:
            </span>
            {product.ingredients.join(', ')}
          </div>
        </div>

        {/* Price and Action Buttons at Bottom */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-4 border-t border-wellness-gray-100 pt-4">
            <span className="text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest">
              Price
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="text-lg font-black text-wellness-navy">
                ₹{sp.toLocaleString('en-IN')}
              </span>
              {mrp > sp && (
                <span className="text-xs text-wellness-charcoal/40 line-through font-bold">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Visible Dual Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/products/${product.id}`}
              className="py-3 px-2 border border-wellness-gray-200 hover:border-wellness-navy bg-white hover:bg-wellness-navy hover:text-white text-[10px] font-extrabold uppercase tracking-widest text-wellness-navy text-center rounded-xl transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Eye size={12} className="stroke-[2.5]" />
              <span>Details</span>
            </Link>
            <button
              disabled={isOutOfStock}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isOutOfStock) {
                  onAddToCart(product, 1);
                }
              }}
              className={`py-3 px-2 text-[10px] font-extrabold uppercase tracking-widest text-center rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 ${
                isOutOfStock
                  ? 'bg-wellness-gray-200 text-wellness-charcoal/40 cursor-not-allowed border border-wellness-gray-300'
                  : 'bg-wellness-green hover:bg-wellness-navy text-white hover:shadow-md cursor-pointer active:scale-95'
              }`}
            >
              <ShoppingCart size={12} className="stroke-[2.5]" />
              <span>{isOutOfStock ? 'Out of Stock' : 'Quick Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
