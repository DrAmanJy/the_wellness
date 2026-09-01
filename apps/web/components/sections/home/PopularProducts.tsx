'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ShoppingCart, Eye, Star, ArrowRight, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { products, Product } from '@/lib/products';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type TabType = 'best-sellers' | 'new-arrivals' | 'most-rated';

export default function PopularProducts() {
  const container = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { toggleProductInWishlist, isInWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<TabType>('best-sellers');
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
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

  // Get specific subsets of products based on tab
  useEffect(() => {
    const sourceProducts = productsList.length > 0 ? productsList : products;
    const getProduct = (id: string): Product => {
      return (
        sourceProducts.find((p) => p.id === id) || (products.find((p) => p.id === id) as Product)
      );
    };

    let items: Product[] = [];
    if (activeTab === 'best-sellers') {
      items = [
        getProduct('respira-inhaler-pro'),
        getProduct('pediacetamol-suspension'),
        getProduct('osteo-flex-advanced'),
      ].filter(Boolean);
    } else if (activeTab === 'new-arrivals') {
      items = [
        getProduct('willmox-500'),
        getProduct('cardiostatin-40'),
        getProduct('neurocognin-xr'),
      ].filter(Boolean);
    } else if (activeTab === 'most-rated') {
      items = [
        getProduct('respira-inhaler-pro'),
        getProduct('neurocognin-xr'),
        getProduct('osteo-flex-advanced'),
      ].filter(Boolean);
    }
    setVisibleProducts(items);
  }, [activeTab, productsList]);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        // Section header entrance
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
      }, container);

      return () => {
        ctx.revert();
      };
    },
    { scope: container },
  );

  // Grid items animation on tab changes
  useGSAP(() => {
    if (gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
      );
    }
  }, [visibleProducts]);

  const getSimulatedRating = (id: string) => {
    if (id === 'respira-inhaler-pro') return 5;
    if (id === 'neurocognin-xr') return 4.9;
    if (id === 'osteo-flex-advanced') return 4.9;
    if (id === 'cardiostatin-40') return 4.8;
    return 4.5;
  };

  return (
    <section ref={container} className="py-24 bg-white border-b border-wellness-gray-200">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header & Tab Controls */}
        <div className="popular-header flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 pb-6 border-b border-wellness-gray-200/60">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-wellness-navy uppercase tracking-tight">
              Popular Healthcare Products
            </h2>
            <p className="text-sm text-wellness-charcoal/60 font-semibold">
              Explore our highest efficiency remedies curated across doctors&apos; recommendations
              and patient reviews.
            </p>
          </div>

          {/* E-Commerce Tab Links */}
          <div className="flex gap-2 bg-[#FAF8F5] p-1.5 rounded-xl border border-wellness-gray-200/50">
            {(
              [
                { id: 'best-sellers', label: 'Best Sellers' },
                { id: 'new-arrivals', label: 'New Arrivals' },
                { id: 'most-rated', label: 'Most Rated' },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`px-4.5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-wellness-navy text-white shadow'
                      : 'text-wellness-charcoal/70 hover:text-wellness-navy hover:bg-wellness-gray-100/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabbed Products Grid Shelf */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleProducts.map((product) => {
            const rating = getSimulatedRating(product.id);
            return (
              <div
                key={product.id}
                className="group bg-white border border-wellness-gray-200 rounded-[32px] overflow-hidden hover:shadow-xl hover:border-wellness-green/30 transition-all duration-350 flex flex-col"
              >
                {/* Image and Badges */}
                <div className="relative aspect-[4/3] bg-wellness-gray-100/50 overflow-hidden shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Category badge */}
                  <span className="absolute top-4 left-4 bg-wellness-green text-white text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow-sm z-10">
                    {product.category}
                  </span>

                  {/* Type Prescription / OTC Badge */}
                  <span
                    className={`absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm z-10 uppercase tracking-wider ${
                      product.type === 'Prescription (Rx)'
                        ? 'bg-red-500 text-white'
                        : 'bg-wellness-navy text-white'
                    }`}
                  >
                    {product.type === 'Prescription (Rx)' ? 'Rx Prescription' : 'OTC'}
                  </span>

                  {/* Wishlist toggle button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleProductInWishlist(product);
                    }}
                    className="absolute top-12 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-wellness-gray-200/50 flex items-center justify-center text-wellness-navy hover:text-red-500 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer group/wishlist"
                    aria-label="Toggle Wishlist"
                  >
                    <Heart
                      size={15}
                      className={
                        isInWishlist(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-wellness-navy group-hover/wishlist:text-red-500'
                      }
                    />
                  </button>

                  {/* Hover overlay panel */}
                  <div className="absolute inset-0 bg-wellness-navy/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 z-10 px-4 backdrop-blur-[2px]">
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                      }}
                      className="w-full max-w-[160px] bg-wellness-green hover:bg-white hover:text-wellness-navy text-white text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      <ShoppingCart size={14} />
                      Add to Cart
                    </button>
                    <Link
                      href={`/products/${product.id}`}
                      className="w-full max-w-[160px] bg-white/15 hover:bg-white text-white hover:text-wellness-navy text-xs font-bold py-3 px-4 rounded-xl border border-white/25 hover:border-transparent transition-all flex items-center justify-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-[50ms]"
                    >
                      <Eye size={14} />
                      Quick View
                    </Link>
                  </div>
                </div>

                {/* Content Panel */}
                <div className="p-6 flex flex-col flex-grow justify-between space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-wellness-charcoal/40 uppercase tracking-widest">
                        Item ID: {product.id.slice(0, 8)}
                      </span>

                      {/* Rating details */}
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-extrabold text-wellness-navy">{rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-heading font-bold text-wellness-navy group-hover:text-wellness-green transition-colors line-clamp-1">
                      <Link href={`/products/${product.id}`}>{product.name}</Link>
                    </h3>

                    <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-semibold line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Cart CTA footer */}
                  <div className="pt-4 border-t border-wellness-gray-100 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-wellness-navy">
                      ₹{product.price.toFixed(2)}
                    </span>

                    <button
                      onClick={() => {
                        addToCart(product, 1);
                      }}
                      className="bg-wellness-gray-100 hover:bg-wellness-navy text-wellness-navy hover:text-white p-2.5 rounded-xl transition-all cursor-pointer border border-transparent shadow-sm hover:shadow"
                      aria-label="Add to Cart"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all button bottom banner */}
        <div className="mt-16 text-center">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-wellness-green hover:text-wellness-navy text-sm font-extrabold uppercase tracking-wider pb-1 border-b-2 border-transparent hover:border-wellness-navy transition-colors"
          >
            <span>View Our Whole Shop Catalog</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
