'use client';

import { HeartPulse, Brain, Wind, Syringe, Sparkles, Baby } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

import { products } from '@/lib/products';

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

export default function FeaturedCategories() {
  const getProductCount = (category: string) => {
    return products.filter((p) => p.category === category).length;
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
          <p className="text-sm text-wellness-charcoal/90 font-bold">
            Navigate through our certified pharmaceutical divisions and wellness formulations to
            find target therapeutics.
          </p>
        </motion.div>

        {/* Categories Circle Grid */}
        <div className="categories-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {categoriesList.map((cat, index) => {
            const IconComponent = cat.icon;
            const count = getProductCount(cat.name);

            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
              >
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="category-card group flex flex-col items-center text-center p-6 bg-white border border-wellness-gray-200 rounded-2xl hover:shadow-xl hover:border-wellness-green/50 transition-all duration-300 cursor-pointer shadow-sm h-full"
                >
                  {/* Circle Icon Container */}
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center border mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${cat.color}`}
                  >
                    <IconComponent size={32} className="stroke-[1.8]" />
                  </div>

                  {/* Text Title */}
                  <h3 className="text-sm font-extrabold text-wellness-navy group-hover:text-wellness-green transition-colors uppercase tracking-wider">
                    {cat.name}
                  </h3>

                  {/* Product Count Badge */}
                  <span className="text-[10px] text-wellness-charcoal/80 font-bold mt-1 bg-wellness-gray-100 px-2 py-0.5 rounded-full border border-wellness-gray-200/50">
                    {count} {count === 1 ? 'Product' : 'Products'}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
