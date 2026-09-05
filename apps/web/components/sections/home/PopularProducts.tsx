'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ShoppingCart, Eye, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type TabType = 'best-sellers' | 'new-arrivals' | 'featured';

type ApiProduct = {
  id: string;
  name: string;
  categoryName?: string;
  category?: string;
  type?: string;
  description?: string;
  primaryImage?: string;
  image?: string;
  sellingPrice?: string | number;
  isBestSeller?: boolean;
  isNewest?: boolean;
  isFeatured?: boolean;
  availableQty?: number;
  stockQty?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'discontinued';
};

type ApiResponse = {
  success?: boolean;
  products?: ApiProduct[];
  data?: {
    products?: ApiProduct[];
    items?: ApiProduct[];
  };
};

export default function PopularProducts() {
  const container = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<TabType>('best-sellers');
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/products`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const json = (await res.json()) as ApiResponse;
          const items = json.data?.products || json.data?.items || json.products || [];
          if (Array.isArray(items)) {
            const mapped: Product[] = items.map((item) => {
              const sp = item.sellingPrice;
              const price = typeof sp === 'number' ? sp : parseFloat(sp || '0');
              const itemType =
                item.type === 'Prescription (Rx)'
                  ? ('Prescription (Rx)' as const)
                  : ('Over-The-Counter (OTC)' as const);

              return {
                id: item.id,
                name: item.name,
                category: item.categoryName || item.category || 'Uncategorized',
                type: itemType,
                description: item.description || 'No clinical description provided.',
                benefits: [],
                ingredients: [],
                image:
                  item.primaryImage ||
                  item.image ||
                  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
                price,
                isBestSeller: item.isBestSeller,
                isNewest: item.isNewest,
                isFeatured: item.isFeatured,
                availableQty: item.availableQty ?? item.stockQty,
                stockStatus: item.stockStatus,
              };
            });
            setProductsList(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load products in PopularProducts:', err);
      } finally {
        setLoading(false);
      }
    }
    void fetchProducts();
  }, []);

  useEffect(() => {
    let items: Product[];
    if (activeTab === 'best-sellers') {
      const best = productsList.filter((p) => p.isBestSeller);
      items = (best.length > 0 ? best : productsList).slice(0, 3);
    } else if (activeTab === 'new-arrivals') {
      const newest = productsList.filter((p) => p.isNewest);
      items = (newest.length > 0 ? newest : productsList).slice(0, 3);
    } else {
      const feat = productsList.filter((p) => p.isFeatured);
      items = (feat.length > 0 ? feat : productsList).slice(0, 3);
    }
    setVisibleProducts(items);
  }, [activeTab, productsList]);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        gsap.from('.popular-header', {
          scrollTrigger: {
            trigger: '.popular-header',
            start: 'top 85%',
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });

        if (visibleProducts.length > 0) {
          gsap.from('.popular-card', {
            scrollTrigger: {
              trigger: '.popular-grid',
              start: 'top 80%',
            },
            y: 40,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
          });
        }
      }, container);

      return () => {
        ctx.revert();
      };
    },
    { scope: container, dependencies: [visibleProducts] },
  );

  return (
    <section ref={container} className="py-24 bg-white border-b border-wellness-gray-200">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="popular-header flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wellness-green/10 text-wellness-green text-xs font-extrabold uppercase tracking-wider">
              <span>Popular Portfolio</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-wellness-navy uppercase tracking-tight">
              Essential Healthcare Products
            </h2>
            <p className="text-wellness-charcoal/70 text-sm font-semibold">
              Explore top-performing pharmaceutical solutions and daily healthcare products.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-wellness-gray-100 p-1.5 rounded-2xl border border-wellness-gray-200/80 self-start md:self-auto">
            <button
              onClick={() => {
                setActiveTab('best-sellers');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                activeTab === 'best-sellers'
                  ? 'bg-wellness-navy text-white shadow-md'
                  : 'text-wellness-charcoal/70 hover:text-wellness-navy hover:bg-white/50'
              }`}
            >
              Best Sellers
            </button>
            <button
              onClick={() => {
                setActiveTab('new-arrivals');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                activeTab === 'new-arrivals'
                  ? 'bg-wellness-navy text-white shadow-md'
                  : 'text-wellness-charcoal/70 hover:text-wellness-navy hover:bg-white/50'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => {
                setActiveTab('featured');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-wellness-navy text-white shadow-md'
                  : 'text-wellness-charcoal/70 hover:text-wellness-navy hover:bg-white/50'
              }`}
            >
              Featured
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-16 text-center text-wellness-charcoal/50">Loading products...</div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-16 text-center text-wellness-charcoal/50">No products available.</div>
        ) : (
          <div
            ref={gridRef}
            className="popular-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {visibleProducts.map((product) => {
              const stock = product.availableQty ?? product.inventoryQty ?? product.stockQty ?? 0;
              const isOutOfStock =
                stock <= 0 ||
                product.stockStatus === 'out_of_stock' ||
                product.stockStatus === 'discontinued';

              return (
                <div
                  key={product.id}
                  className="popular-card group bg-wellness-gray-50/50 hover:bg-white border border-wellness-gray-200/80 rounded-[32px] overflow-hidden hover:shadow-[0_20px_50px_rgba(43,122,120,0.08)] hover:border-wellness-green/30 transition-all duration-500 flex flex-col justify-between"
                >
                  <div className="p-6 space-y-6">
                    {/* Image & Type Badge */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-wellness-gray-100/60">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className={`object-cover transition-transform duration-700 ${
                          isOutOfStock ? 'grayscale-[30%]' : 'group-hover:scale-105'
                        }`}
                        referrerPolicy="no-referrer"
                      />

                      {/* Stock / Type / Featured / Bestseller Badges */}
                      {isOutOfStock ? (
                        <span className="absolute top-4 right-4 bg-red-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider shadow-sm z-10">
                          Out of Stock
                        </span>
                      ) : (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                          {product.isFeatured && (
                            <span className="bg-wellness-green text-wellness-navy font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                              Featured
                            </span>
                          )}
                          {product.isBestSeller && (
                            <span className="bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                              Bestseller
                            </span>
                          )}
                          <span className="bg-wellness-navy text-white text-[9px] font-bold px-2.5 py-1 rounded shadow-sm">
                            {product.type}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta & Title */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-extrabold tracking-wider uppercase text-wellness-green bg-wellness-green/10 border border-wellness-green/20 px-2.5 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-heading font-black text-wellness-navy group-hover:text-wellness-green transition-colors line-clamp-1">
                        <Link href={`/products/${product.id}`}>{product.name}</Link>
                      </h3>

                      <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-semibold line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="p-6 pt-0 border-t border-wellness-gray-150/50 mt-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-wellness-charcoal/40 uppercase tracking-wider block">
                        Price
                      </span>
                      <span className="text-xl font-black text-wellness-navy">
                        ₹
                        {product.price.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        disabled={isOutOfStock}
                        onClick={() => {
                          if (!isOutOfStock) {
                            void addToCart(product, 1);
                          }
                        }}
                        className={`text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow-sm ${
                          isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-wellness-green hover:bg-wellness-navy text-white hover:shadow active:scale-98 cursor-pointer'
                        }`}
                      >
                        <ShoppingCart size={14} />
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>

                      <Link
                        href={`/products/${product.id}`}
                        className="p-2.5 bg-wellness-gray-100 hover:bg-wellness-gray-200 text-wellness-navy rounded-xl transition-all duration-300 flex items-center justify-center border border-wellness-gray-200/50 cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Catalog Banner */}
        <div className="mt-16 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-wellness-navy hover:text-wellness-green transition-colors border-b-2 border-wellness-navy hover:border-wellness-green pb-1"
          >
            Explore Complete Product Portfolio
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
