'use client';

import { HeartPulse, Brain, Wind, Syringe, Sparkles, Baby } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const categoriesList = [
  {
    name: 'Respiratory',
    icon: Wind,
    color: 'bg-teal-50 text-teal-600 border-teal-200',
  },
  {
    name: 'Cardiovascular',
    icon: HeartPulse,
    color: 'bg-red-50 text-red-600 border-red-200',
  },
  {
    name: 'Neurology',
    icon: Brain,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    name: 'Anti-Infectives',
    icon: Syringe,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    name: 'OTC & Wellness',
    icon: Sparkles,
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    name: 'Pediatrics',
    icon: Baby,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
];

type ApiProduct = {
  categoryName?: string;
  category?: string;
};

type ApiResponse = {
  success?: boolean;
  products?: ApiProduct[];
  data?: {
    products?: ApiProduct[];
    items?: ApiProduct[];
  };
};

export default function FeaturedCategories() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchCounts() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/products`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const json = (await res.json()) as ApiResponse;
          const items = json.data?.products || json.data?.items || json.products || [];
          if (Array.isArray(items)) {
            const counts: Record<string, number> = {};
            items.forEach((item) => {
              const cat = item.categoryName || item.category || 'Uncategorized';
              counts[cat] = (counts[cat] || 0) + 1;
            });
            setCategoryCounts(counts);
          }
        }
      } catch (err) {
        console.error('Failed to fetch category product counts:', err);
      }
    }
    void fetchCounts();
  }, []);

  const getProductCount = (category: string) => {
    return categoryCounts[category] || 0;
  };

  return (
    <section className="py-20 bg-white border-b border-wellness-gray-200">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="categories-header text-center max-w-xl mx-auto mb-16 space-y-3"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-black text-wellness-navy uppercase tracking-tight">
            Explore Featured Categories
          </h2>
          <p className="text-wellness-charcoal/70 text-sm font-semibold">
            Discover tailored pharmaceutical solutions across key healthcare categories.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categoriesList.map((cat, idx) => {
            const Icon = cat.icon;
            const count = getProductCount(cat.name);
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center justify-between p-6 bg-wellness-gray-50 hover:bg-white rounded-3xl border border-wellness-gray-200/80 hover:border-wellness-green/30 hover:shadow-xl hover:shadow-wellness-green/5 transition-all duration-300 h-full text-center"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${cat.color} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                  >
                    <Icon size={26} />
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-wellness-navy group-hover:text-wellness-green transition-colors text-sm mb-1">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] font-bold text-wellness-charcoal/50 group-hover:text-wellness-charcoal/80 transition-colors">
                      {count} {count === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
