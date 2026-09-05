'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useState, useEffect } from 'react';

import { Product } from '@/lib/products';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewest?: boolean;
};

type ApiResponse = {
  success?: boolean;
  products?: ApiProduct[];
  data?: {
    products?: ApiProduct[];
    items?: ApiProduct[];
  };
};

export default function FeaturedProducts() {
  const container = useRef<HTMLDivElement>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
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
                description: item.description || 'No description provided.',
                benefits: [],
                ingredients: [],
                image:
                  item.primaryImage ||
                  item.image ||
                  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
                price,
                isFeatured: item.isFeatured ?? false,
                isBestSeller: item.isBestSeller ?? false,
                isNewest: item.isNewest ?? false,
              };
            });

            const featuredOnly = mapped.filter((p) => p.isFeatured);
            setFeaturedProducts(featuredOnly.length > 0 ? featuredOnly : mapped.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load featured products from API:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadProducts();
  }, []);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
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

        if (featuredProducts.length > 0) {
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
        }
      }, container);

      return () => {
        ctx.revert();
      };
    },
    { scope: container, dependencies: [featuredProducts] },
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

        {loading ? (
          <div className="py-16 text-center text-wellness-charcoal/50">Loading products...</div>
        ) : featuredProducts.length === 0 ? (
          <div className="py-16 text-center text-wellness-charcoal/50">
            No products found in the catalog.
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
