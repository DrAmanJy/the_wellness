'use client';

import { ShoppingCart, Eye, Star, Flame, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { products, Product } from '@/lib/products';

const dealsList = [
  {
    productId: 'respira-inhaler-pro',
    discount: 15,
    originalPrice: 3735.0,
    salePrice: 3174.75,
    rating: 5,
  },
  {
    productId: 'cardiostatin-40',
    discount: 20,
    originalPrice: 4855.5,
    salePrice: 3884.4,
    rating: 4,
  },
  {
    productId: 'osteo-flex-advanced',
    discount: 20,
    originalPrice: 2074.17,
    salePrice: 1659.34,
    rating: 5,
  },
];

export default function DailyDeals() {
  const { addToCart } = useCart();
  const { toggleProductInWishlist, isInWishlist } = useWishlist();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [productsList, setProductsList] = useState<Product[]>([]);

  // Load from localStorage for admin modifications
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProducts = localStorage.getItem('admin_products');
      if (savedProducts) {
        try {
          setProductsList(JSON.parse(savedProducts));
        } catch (e) {
          console.error(e);
        }
      }
    }
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
    <section className="py-24 bg-[#FDFBF7] border-b border-wellness-gray-200 relative overflow-hidden">
      {/* Floating Decorative Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-wellness-light-green/30 glow-orb opacity-60"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-wellness-light-green/20 glow-orb opacity-40"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header with Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="deals-header flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6"
        >
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-wellness-green font-extrabold uppercase text-xs tracking-widest">
              <Flame
                size={16}
                className="text-wellness-green fill-wellness-green/20 animate-pulse"
              />
              <span>Today&apos;s Hot Deals</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-wellness-navy uppercase tracking-tight">
              Exclusive Scientific Care
            </h2>
            <p className="text-sm text-wellness-charcoal/70 font-semibold leading-relaxed">
              Save big on premium therapeutic items. Exceptional quality backed by scientific
              research, now at limited-time discounted rates.
            </p>
          </div>

          {/* Countdown Clock Widget */}
          <div className="flex items-center gap-3 shrink-0 bg-white/80 backdrop-blur-md border border-wellness-navy/10 px-5 py-3 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-wellness-green mr-1">
              OFFER EXPIRES IN:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-wellness-navy">
              <div className="flex items-baseline">
                <span className="text-xl font-black">{formatNumber(timeLeft.hours)}</span>
                <span className="text-[9px] font-extrabold text-wellness-charcoal/50 ml-0.5 mr-1 uppercase">
                  h
                </span>
              </div>
              <span className="text-wellness-green font-bold animate-pulse">:</span>
              <div className="flex items-baseline">
                <span className="text-xl font-black">{formatNumber(timeLeft.minutes)}</span>
                <span className="text-[9px] font-extrabold text-wellness-charcoal/50 ml-0.5 mr-1 uppercase">
                  m
                </span>
              </div>
              <span className="text-wellness-green font-bold animate-pulse">:</span>
              <div className="flex items-baseline">
                <span className="text-xl font-black text-red-500">
                  {formatNumber(timeLeft.seconds)}
                </span>
                <span className="text-[9px] font-extrabold text-red-500/80 ml-0.5 uppercase">
                  s
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Deals Grid */}
        <div className="deals-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dealsList.map((deal, index) => {
            const product =
              productsList.find((p) => p.id === deal.productId) ||
              products.find((p) => p.id === deal.productId);
            if (!product) return null;

            const savings = deal.originalPrice - deal.salePrice;

            return (
              <motion.div
                key={deal.productId}
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
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Discount Badge */}
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm z-10">
                    -{deal.discount}% OFF
                  </span>

                  {/* Type Badge */}
                  <span className="absolute top-4 right-14 bg-wellness-navy text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                    {product.type}
                  </span>

                  {/* Wishlist toggle button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleProductInWishlist(product);
                    }}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-wellness-gray-200/50 flex items-center justify-center text-wellness-navy hover:text-red-500 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                    aria-label="Toggle Wishlist"
                  >
                    <Heart
                      size={14}
                      className={
                        isInWishlist(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-wellness-navy'
                      }
                    />
                  </button>
                </div>

                {/* Content Panel */}
                <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-extrabold tracking-wider uppercase text-wellness-green bg-wellness-green/10 border border-wellness-green/20 px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={
                              i < deal.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-wellness-gray-200'
                            }
                          />
                        ))}
                      </div>
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
                            {deal.salePrice.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-xs text-wellness-charcoal/40 line-through font-bold">
                            ₹
                            {deal.originalPrice.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-100">
                        Save ₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        onClick={() => {
                          addToCart(product, 1);
                        }}
                        className="flex-1 bg-wellness-green hover:bg-wellness-navy text-white text-xs font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm hover:shadow active:scale-98 cursor-pointer"
                      >
                        <ShoppingCart size={14} />
                        Add to Cart
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
      </div>
    </section>
  );
}
