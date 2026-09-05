'use client';

import { CheckCircle2 } from 'lucide-react';
import React from 'react';

import type { Product } from '@/lib/products';

interface ProductClinicalInfoProps {
  product: Product;
}

export default function ProductClinicalInfo({ product }: ProductClinicalInfoProps) {
  const sp = product.price;
  const mrp = product.mrp || product.originalPrice || Math.round(sp * 1.25);
  const discount = mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;

  return (
    <>
      <div className="inline-block px-4 py-1.5 rounded-full bg-wellness-green/10 text-wellness-green font-semibold text-xs tracking-wider uppercase mb-6 self-start">
        {product.category}
      </div>

      <h1 className="text-4xl md:text-5xl font-heading font-bold text-wellness-navy mb-3 tracking-tight font-sans">
        {product.name}
      </h1>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-3xl font-black text-wellness-navy">
          ₹{sp.toLocaleString('en-IN')}
        </span>
        {mrp > sp && (
          <span className="text-lg text-wellness-charcoal/40 line-through font-bold">
            ₹{mrp.toLocaleString('en-IN')}
          </span>
        )}
        {discount > 0 && (
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="bg-wellness-gray-50 border-l-4 border-wellness-navy p-6 rounded-r-lg mb-10">
        <p className="text-lg text-wellness-charcoal/80 leading-relaxed font-semibold">
          {product.description}
        </p>
      </div>

      {product.benefits.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-heading font-bold text-wellness-navy mb-4 border-b border-wellness-gray-200 pb-2">
            Clinical Benefits
          </h3>
          <ul className="space-y-3">
            {product.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="text-wellness-green shrink-0 mt-0.5" size={20} />
                <span className="text-wellness-charcoal/80 font-semibold">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.ingredients.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-heading font-bold text-wellness-navy mb-4 border-b border-wellness-gray-200 pb-2">
            Active Ingredients & Composition
          </h3>
          <ul className="list-disc list-inside space-y-2 text-wellness-charcoal/80 font-semibold">
            {product.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Product Tags list if any */}
      {product.tags && product.tags.length > 0 && (
        <div className="mb-10">
          <h3 className="text-[10px] font-bold text-wellness-charcoal/40 uppercase tracking-widest mb-3">
            Category Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-wellness-gray-100 text-wellness-navy border border-wellness-gray-205 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
