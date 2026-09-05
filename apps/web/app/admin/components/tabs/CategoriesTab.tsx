'use client';

import { Plus, Layers, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

import { CategoryItem } from '../../types';

import { Product } from '@/lib/products';

interface CategoriesTabProps {
  categoryItems: CategoryItem[];
  products: Product[];
  isRefreshingCategories: boolean;
  onRefreshCategories: () => Promise<void>;
  onAddCategory: (categoryName: string) => Promise<boolean>;
  onDeleteCategory: (cat: CategoryItem) => Promise<void>;
}

export default function CategoriesTab({
  categoryItems,
  products,
  isRefreshingCategories,
  onRefreshCategories,
  onAddCategory,
  onDeleteCategory,
}: CategoriesTabProps) {
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsSubmitting(true);
    const success = await onAddCategory(newCategory.trim());
    setIsSubmitting(false);

    if (success) {
      setNewCategory('');
    }
  };

  return (
    <motion.div
      key="categories"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Category Card */}
        <div className="bg-white border border-wellness-gray-200 rounded-3xl p-6 shadow-sm self-start">
          <h4 className="text-sm font-extrabold text-wellness-navy uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Plus size={16} className="text-wellness-green" />
            New Product Category
          </h4>
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="space-y-4"
          >
            <div>
              <input
                type="text"
                required
                placeholder="e.g. Cardiovascular, Respiratory"
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-wellness-navy hover:bg-wellness-green text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* List Categories */}
        <div className="md:col-span-2 bg-white border border-wellness-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-extrabold text-wellness-navy uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-wellness-green" />
              Product Categories Catalog
            </h4>
            <button
              type="button"
              onClick={() => {
                void onRefreshCategories();
              }}
              disabled={isRefreshingCategories}
              className="bg-wellness-gray-100 hover:bg-wellness-gray-200 text-wellness-navy text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Categories"
            >
              <RefreshCw size={12} className={isRefreshingCategories ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {categoryItems.length === 0 ? (
              <p className="text-xs text-wellness-charcoal/50 py-4 text-center">
                No categories found in the database. Create a new category to get started.
              </p>
            ) : (
              categoryItems.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-wellness-gray-50 border border-wellness-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-wellness-navy/5 flex items-center justify-center text-wellness-navy font-bold text-[10px]">
                      {cat.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-wellness-navy">{cat.name}</span>
                      <p className="text-[10px] text-wellness-charcoal/40 font-semibold mt-0.5">
                        {products.filter((p) => p.category === cat.name).length} Products Assigned
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      void onDeleteCategory(cat);
                    }}
                    className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
