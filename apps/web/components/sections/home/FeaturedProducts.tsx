'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowRight, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';

import { useWishlist } from '@/context/WishlistContext';
import { products } from '@/lib/products';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Get top 3 featured products from our updated list
const featuredProducts = products.slice(0, 3);

export default function FeaturedProducts() {
  const container = useRef<HTMLDivElement>(null);
  const { toggleProductInWishlist, isInWishlist } = useWishlist();

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        // Title animation
        gsap.from('.section-header', {
          scrollTrigger: {
            trigger: '.section-header',
            start: 'top 85%',
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });

        // Products stagger animation
        gsap.from('.product-card', {
          scrollTrigger: {
            trigger: '.products-grid',
            start: 'top 80%',
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });
      }, container);

      return () => {
        ctx.revert();
      };
    },
    { scope: container },
  );

  return (
    <section ref={container} className="py-24 md:py-32 bg-wellness-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="section-header flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wellness-navy mb-4 tracking-tight">
              Flagship Products
            </h2>
            <p className="text-lg text-wellness-charcoal/70">
              Our core portfolio consists of highly effective, rigorously tested therapies trusted
              by millions worldwide.
            </p>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-2 text-wellness-green font-semibold hover:text-wellness-navy transition-colors pb-1 border-b-2 border-transparent hover:border-wellness-navy"
          >
            View all products
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="product-card group block bg-white border border-wellness-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-wellness-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Wishlist toggle button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleProductInWishlist(product);
                  }}
                  className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-wellness-gray-200/50 flex items-center justify-center text-wellness-navy hover:text-red-500 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer group/wishlist"
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

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-wellness-navy shadow-sm">
                  {product.type}
                </div>
              </div>
              <div className="p-8">
                <p className="text-sm font-semibold tracking-wider uppercase text-wellness-green mb-2">
                  {product.category}
                </p>
                <h3 className="text-2xl font-heading font-bold text-wellness-navy group-hover:text-wellness-green transition-colors mb-3">
                  {product.name}
                </h3>
                <p className="text-wellness-charcoal/70 text-sm line-clamp-2">
                  {product.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
