'use client';

import {
  Filter,
  RotateCcw,
  FolderOpen,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  ShieldAlert,
  Activity,
  Sparkles,
  Star,
  Percent,
  ChevronRight,
  Pill,
  ShieldCheck,
} from 'lucide-react';
import React from 'react';

import type { ProductClassification, ProductPriceRange, ProductHighlight } from '../types';

interface ProductFilterSidebarProps {
  categories: string[];
  activeCategory: string;
  activeType: ProductClassification;
  activePrice: ProductPriceRange;
  activeHighlight: ProductHighlight;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onSelectCategory: (cat: string) => void;
  onSelectType: (type: ProductClassification) => void;
  onSelectPrice: (price: ProductPriceRange) => void;
  onSelectHighlight: (highlight: ProductHighlight) => void;
  getCategoryCount: (cat: string) => number;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'cardiorespiratory':
      return <HeartPulse size={13} className="text-red-500" />;
    case 'neurology':
      return <Brain size={13} className="text-indigo-500" />;
    case 'orthopedics':
      return <Bone size={13} className="text-amber-600" />;
    case 'pediatrics':
      return <Baby size={13} className="text-sky-500" />;
    case 'anti-infectives':
      return <ShieldAlert size={13} className="text-teal-600" />;
    default:
      return <Activity size={13} className="text-wellness-green" />;
  }
};

export default function ProductFilterSidebar({
  categories,
  activeCategory,
  activeType,
  activePrice,
  activeHighlight,
  hasActiveFilters,
  onResetFilters,
  onSelectCategory,
  onSelectType,
  onSelectPrice,
  onSelectHighlight,
  getCategoryCount,
}: ProductFilterSidebarProps) {
  return (
    <div className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="lg:sticky lg:top-40 bg-white p-6 rounded-2xl border border-wellness-gray-200 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-wellness-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-wellness-green" />
            <h3 className="text-sm uppercase tracking-wider font-extrabold text-wellness-navy">
              Filters
            </h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-[10px] font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Directory-Tree Category Menu */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest font-black text-wellness-navy/80">
            Category
          </h4>
          <div className="space-y-1">
            {/* All Products root node */}
            <button
              onClick={() => {
                onSelectCategory('All');
                onSelectHighlight('All');
              }}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeCategory === 'All' && activeHighlight === 'All'
                  ? 'bg-wellness-navy text-white shadow-sm'
                  : 'text-wellness-charcoal/70 hover:bg-wellness-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen
                  size={14}
                  className={
                    activeCategory === 'All' && activeHighlight === 'All'
                      ? 'text-wellness-green'
                      : 'text-wellness-charcoal/40'
                  }
                />
                <span>All Products</span>
              </div>
              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  activeCategory === 'All' && activeHighlight === 'All'
                    ? 'bg-wellness-green text-white'
                    : 'bg-wellness-gray-100 text-wellness-charcoal/50'
                }`}
              >
                {getCategoryCount('All')}
              </span>
            </button>

            {/* Subcategories (Therapeutic Areas) */}
            <ul className="ml-5 pl-4 border-l border-wellness-gray-200/70 space-y-1 mt-1">
              {categories
                .filter((cat) => cat !== 'All')
                .map((category, index, filteredArray) => {
                  const isActive = activeCategory === category && activeHighlight === 'All';
                  const isLast = index === filteredArray.length - 1;
                  return (
                    <li key={category} className="relative py-1 flex items-center">
                      {/* Horizontal branch line */}
                      <div className="absolute -left-4 w-3.5 h-px bg-wellness-gray-200/70"></div>
                      {isLast && (
                        <div className="absolute -left-[17px] top-1/2 bottom-0 w-[3px] bg-white"></div>
                      )}

                      <button
                        onClick={() => {
                          onSelectCategory(category);
                          onSelectHighlight('All');
                        }}
                        className={`text-left w-full pl-2 pr-3 py-1.5 rounded-lg transition-all duration-300 text-xs font-bold flex items-center justify-between group cursor-pointer ${
                          isActive
                            ? 'bg-wellness-navy/10 text-wellness-navy border-l-2 border-wellness-green pl-1.5'
                            : 'text-wellness-charcoal/70 hover:bg-wellness-gray-100/50 hover:text-wellness-navy'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-wellness-charcoal/30 group-hover:text-wellness-green transition-colors">
                            {getCategoryIcon(category)}
                          </span>
                          <span className="truncate">{category}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'bg-wellness-green text-white shadow-sm'
                              : 'bg-wellness-gray-100 text-wellness-charcoal/50 group-hover:bg-white group-hover:text-wellness-navy'
                          }`}
                        >
                          {getCategoryCount(category)}
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>

            {/* Quick highlights filters */}
            <div className="pt-2 border-t border-wellness-gray-100/70 space-y-1">
              <button
                onClick={() => {
                  onSelectCategory('All');
                  onSelectHighlight('new');
                }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activeHighlight === 'new'
                    ? 'bg-wellness-navy text-white shadow-sm'
                    : 'text-wellness-charcoal/70 hover:bg-wellness-gray-100 group'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={14}
                    className={
                      activeHighlight === 'new'
                        ? 'text-wellness-green'
                        : 'text-wellness-charcoal/40 group-hover:text-wellness-green'
                    }
                  />
                  <span>New Arrival</span>
                </div>
                <ChevronRight
                  size={12}
                  className={
                    activeHighlight === 'new'
                      ? 'text-white'
                      : 'text-wellness-charcoal/30 group-hover:translate-x-0.5 transition-transform'
                  }
                />
              </button>

              <button
                onClick={() => {
                  onSelectCategory('All');
                  onSelectHighlight('best');
                }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activeHighlight === 'best'
                    ? 'bg-wellness-navy text-white shadow-sm'
                    : 'text-wellness-charcoal/70 hover:bg-wellness-gray-100 group'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star
                    size={14}
                    className={
                      activeHighlight === 'best'
                        ? 'text-wellness-green fill-wellness-green'
                        : 'text-wellness-charcoal/40 group-hover:text-wellness-green'
                    }
                  />
                  <span>Best Seller</span>
                </div>
                <ChevronRight
                  size={12}
                  className={
                    activeHighlight === 'best'
                      ? 'text-white'
                      : 'text-wellness-charcoal/30 group-hover:translate-x-0.5 transition-transform'
                  }
                />
              </button>

              <button
                onClick={() => {
                  onSelectCategory('All');
                  onSelectHighlight('featured');
                }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activeHighlight === 'featured'
                    ? 'bg-wellness-navy text-white shadow-sm'
                    : 'text-wellness-charcoal/70 hover:bg-wellness-gray-100 group'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity
                    size={14}
                    className={
                      activeHighlight === 'featured'
                        ? 'text-wellness-green'
                        : 'text-wellness-charcoal/40 group-hover:text-wellness-green'
                    }
                  />
                  <span>Featured Therapeutics</span>
                </div>
                <ChevronRight
                  size={12}
                  className={
                    activeHighlight === 'featured'
                      ? 'text-white'
                      : 'text-wellness-charcoal/30 group-hover:translate-x-0.5 transition-transform'
                  }
                />
              </button>

              <button
                onClick={() => {
                  onSelectCategory('All');
                  onSelectHighlight('discount');
                }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activeHighlight === 'discount'
                    ? 'bg-wellness-navy text-white shadow-sm'
                    : 'text-wellness-charcoal/70 hover:bg-wellness-gray-100 group'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Percent
                    size={14}
                    className={
                      activeHighlight === 'discount'
                        ? 'text-wellness-green'
                        : 'text-wellness-charcoal/40 group-hover:text-wellness-green'
                    }
                  />
                  <span>On Discount</span>
                </div>
                <ChevronRight
                  size={12}
                  className={
                    activeHighlight === 'discount'
                      ? 'text-white'
                      : 'text-wellness-charcoal/30 group-hover:translate-x-0.5 transition-transform'
                  }
                />
              </button>
            </div>
          </div>
        </div>

        {/* Product Classification (Type) Menu */}
        <div className="space-y-3 pt-4 border-t border-wellness-gray-100">
          <h4 className="text-xs uppercase tracking-widest font-black text-wellness-navy/80 flex items-center justify-between">
            <span>Classification</span>
            <ChevronRight size={12} className="text-wellness-charcoal/30" />
          </h4>
          <ul className="space-y-1">
            {(['All', 'Prescription', 'OTC'] as const).map((type) => {
              const isActive = activeType === type;
              return (
                <li key={type}>
                  <button
                    onClick={() => {
                      onSelectType(type);
                    }}
                    className={`text-left w-full px-3 py-2 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-wellness-navy text-white shadow-sm'
                        : 'text-wellness-charcoal/70 hover:bg-wellness-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {type === 'All' ? (
                        <Pill
                          size={13}
                          className={isActive ? 'text-wellness-green' : 'text-wellness-charcoal/40'}
                        />
                      ) : type === 'Prescription' ? (
                        <ShieldCheck
                          size={13}
                          className={isActive ? 'text-wellness-green' : 'text-wellness-charcoal/40'}
                        />
                      ) : (
                        <Sparkles
                          size={13}
                          className={isActive ? 'text-wellness-green' : 'text-wellness-charcoal/40'}
                        />
                      )}
                      <span>
                        {type === 'All'
                          ? 'All Classifications'
                          : type === 'Prescription'
                            ? 'Prescription (Rx)'
                            : 'Over-The-Counter (OTC)'}
                      </span>
                    </div>
                    <ChevronRight
                      size={12}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'text-white' : 'text-wellness-charcoal/40'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Price Range Menu */}
        <div className="space-y-3 pt-4 border-t border-wellness-gray-100">
          <h4 className="text-xs uppercase tracking-widest font-black text-wellness-navy/80 flex items-center justify-between">
            <span>Price Range</span>
            <ChevronRight size={12} className="text-wellness-charcoal/30" />
          </h4>
          <ul className="space-y-1">
            {(
              [
                { key: 'All', label: 'All Prices' },
                { key: 'under-2000', label: 'Under ₹2,000' },
                { key: '2000-5000', label: '₹2,000 - ₹5,000' },
                { key: 'above-5000', label: 'Over ₹5,000' },
              ] as const
            ).map((item) => {
              const isActive = activePrice === item.key;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => {
                      onSelectPrice(item.key);
                    }}
                    className={`text-left w-full px-3 py-2 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-wellness-navy text-white shadow-sm'
                        : 'text-wellness-charcoal/70 hover:bg-wellness-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[13px] font-extrabold ${
                          isActive ? 'text-wellness-green' : 'text-wellness-charcoal/40'
                        }`}
                      >
                        ₹
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight
                      size={12}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'text-white' : 'text-wellness-charcoal/40'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
