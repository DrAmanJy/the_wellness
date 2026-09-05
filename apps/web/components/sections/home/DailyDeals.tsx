'use client';

import { ShoppingCart, Eye, Clock, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';

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
  mrp?: string | number;
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

export default function DailyDeals() {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
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
              const mrpVal = item.mrp;
              const mrp = typeof mrpVal === 'number' ? mrpVal : parseFloat(mrpVal || '0');
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
                mrp,
                availableQty: item.availableQty ?? item.stockQty,
                stockStatus: item.stockStatus,
              };
            });
            setProductsList(mapped.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load daily deals from API:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadDeals();
  }, []);

  // Countdown timer to midnight
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <section className="py-24 bg-wellness-gray-50/70 border-b border-wellness-gray-200">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Banner Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="deals-header flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-8 bg-wellness-navy text-white p-8 md:p-12 rounded-[36px] shadow-xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-wellness-green/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wellness-green text-wellness-navy text-xs font-black uppercase tracking-wider">
              <Flame size={14} className="fill-wellness-navy" />
              <span>Limited Time Offers</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-white">
              Daily Clinical Deals
            </h2>
            <p className="text-white/70 text-sm md:text-base font-semibold">
              Exclusive daily discounts on essential medications and healthcare formulations.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-5 md:p-6 rounded-3xl flex items-center gap-4 shrink-0">
            <div className="text-wellness-green p-3 bg-white/10 rounded-2xl">
              <Clock size={28} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 block mb-1">
                Deals Expire In
              </span>
              <div className="flex items-center gap-2 text-2xl md:text-3xl font-black font-mono tracking-wider text-white">
                <span>{formatNumber(timeLeft.hours)}</span>
                <span className="text-wellness-green font-bold animate-pulse">:</span>
                <span>{formatNumber(timeLeft.minutes)}</span>
                <span className="text-wellness-green font-bold animate-pulse">:</span>
                <span className="text-wellness-green">{formatNumber(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Deals Grid */}
        {loading ? (
          <div className="py-16 text-center text-wellness-charcoal/50">Loading deals...</div>
        ) : productsList.length === 0 ? (
          <div className="py-16 text-center text-wellness-charcoal/50">
            No daily deals available.
          </div>
        ) : (
          <div className="deals-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productsList.map((product, index) => {
              const stock = product.availableQty ?? product.inventoryQty ?? product.stockQty ?? 0;
              const isOutOfStock =
                stock <= 0 ||
                product.stockStatus === 'out_of_stock' ||
                product.stockStatus === 'discontinued';

              const sp = product.price;
              const mrp = product.mrp && product.mrp > sp ? product.mrp : Math.round(sp * 1.2);
              const discount = mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;
              const savings = mrp > sp ? mrp - sp : 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                  className="deal-card group bg-white border border-wellness-gray-200/60 rounded-[32px] overflow-hidden hover:shadow-[0_20px_50px_rgba(43,122,120,0.08)] hover:border-wellness-green/30 transition-all duration-500 flex flex-col h-full"
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-[4/3] bg-wellness-gray-100/50 overflow-hidden shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-cover transition-transform duration-700 ${
                        isOutOfStock ? 'grayscale-[30%]' : 'group-hover:scale-105'
                      }`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm z-10">
                        -{discount}% OFF
                      </span>
                    )}

                    {/* Stock / Type Badge */}
                    {isOutOfStock ? (
                      <span className="absolute top-4 right-4 bg-red-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider shadow-sm z-10">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="absolute top-4 right-4 bg-wellness-navy text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                        {product.type}
                      </span>
                    )}
                  </div>

                  {/* Content Panel */}
                  <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-extrabold tracking-wider uppercase text-wellness-green bg-wellness-green/10 border border-wellness-green/20 px-2.5 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-heading font-black text-wellness-navy group-hover:text-wellness-green transition-colors line-clamp-1">
                        <Link href={`/products/${product.id}`}>{product.name}</Link>
                      </h3>

                      <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-semibold line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Pricing & Add to Cart */}
                    <div className="pt-4 border-t border-wellness-gray-150 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-wellness-charcoal/40 uppercase tracking-wider">
                            Special Price
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-wellness-navy">
                              ₹
                              {sp.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            {mrp > sp && (
                              <span className="text-xs text-wellness-charcoal/40 line-through font-bold">
                                ₹
                                {mrp.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        {savings > 0 && (
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-100">
                            Save ₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <button
                          disabled={isOutOfStock}
                          onClick={() => {
                            if (!isOutOfStock) {
                              void addToCart(product, 1);
                            }
                          }}
                          className={`flex-1 text-xs font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm ${
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
                          className="px-4 bg-wellness-gray-100 hover:bg-wellness-gray-200 text-wellness-navy text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center border border-wellness-gray-200/50 cursor-pointer"
                          title="View Product Details"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
