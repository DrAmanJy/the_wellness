'use client';

import clsx from 'clsx';
import { ArrowRight, Loader2, Pill, Search, Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

import type { SearchSuggestionItem } from './types';

interface NavbarSearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  suggestions: SearchSuggestionItem[];
  isLoadingSuggestions: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  focusedIndex: number;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
  onSearchSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onSuggestionClick: (item: SearchSuggestionItem) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
}

export default function NavbarSearch({
  searchQuery,
  setSearchQuery,
  suggestions,
  isLoadingSuggestions,
  showSuggestions,
  setShowSuggestions,
  focusedIndex,
  setFocusedIndex,
  onSearchSubmit,
  onSuggestionClick,
  onKeyDown,
  containerRef,
  isMobile = false,
}: NavbarSearchProps) {
  const router = useRouter();

  if (isMobile) {
    return (
      <div ref={containerRef} className="relative mb-6 w-full">
        <form onSubmit={onSearchSubmit} className="flex w-full relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 1) setShowSuggestions(true);
            }}
            onKeyDown={onKeyDown}
            className="w-full px-4 py-2.5 rounded-l-xl border border-wellness-gray-200 text-xs font-semibold focus:outline-none"
          />
          <button
            type="submit"
            className="bg-wellness-navy text-white px-5 rounded-r-xl flex items-center justify-center border border-transparent cursor-pointer"
          >
            {isLoadingSuggestions ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Search size={16} />
            )}
          </button>
        </form>

        {/* Mobile Suggestions Popover */}
        <AnimatePresence>
          {showSuggestions && searchQuery.trim().length >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-wellness-gray-200 rounded-2xl shadow-2xl z-[150] overflow-hidden py-2 text-left"
            >
              <SuggestionsContent
                searchQuery={searchQuery}
                isLoadingSuggestions={isLoadingSuggestions}
                suggestions={suggestions}
                focusedIndex={focusedIndex}
                setFocusedIndex={setFocusedIndex}
                onSuggestionClick={onSuggestionClick}
                onViewAll={() => {
                  setShowSuggestions(false);
                  router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="hidden md:flex flex-1 max-w-md relative">
      <form onSubmit={onSearchSubmit} className="w-full flex relative items-stretch">
        <input
          type="text"
          placeholder="Search for therapeutics, generic medicines, ingredients..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (searchQuery.trim().length >= 1) setShowSuggestions(true);
          }}
          onKeyDown={onKeyDown}
          className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-wellness-gray-200 text-xs font-semibold focus:outline-none focus:border-wellness-green focus:ring-1 focus:ring-wellness-green bg-[#FAF8F5]/80 focus:bg-white transition-all shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-wellness-charcoal/50 hover:text-wellness-green transition-colors cursor-pointer"
          aria-label="Search"
        >
          {isLoadingSuggestions ? (
            <Loader2 size={16} className="animate-spin text-wellness-green" />
          ) : (
            <Search size={16} />
          )}
        </button>
      </form>

      {/* Desktop Suggestions Popover */}
      <AnimatePresence>
        {showSuggestions && searchQuery.trim().length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-wellness-gray-200 rounded-2xl shadow-2xl z-[150] overflow-hidden py-2 text-left"
          >
            <SuggestionsContent
              searchQuery={searchQuery}
              isLoadingSuggestions={isLoadingSuggestions}
              suggestions={suggestions}
              focusedIndex={focusedIndex}
              setFocusedIndex={setFocusedIndex}
              onSuggestionClick={onSuggestionClick}
              onViewAll={() => {
                setShowSuggestions(false);
                router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuggestionsContent({
  searchQuery,
  isLoadingSuggestions,
  suggestions,
  focusedIndex,
  setFocusedIndex,
  onSuggestionClick,
  onViewAll,
}: {
  searchQuery: string;
  isLoadingSuggestions: boolean;
  suggestions: SearchSuggestionItem[];
  focusedIndex: number;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
  onSuggestionClick: (item: SearchSuggestionItem) => void;
  onViewAll: () => void;
}) {
  if (isLoadingSuggestions) {
    return (
      <div className="px-4 py-4 text-xs font-semibold text-wellness-charcoal/60 flex items-center gap-2 justify-center">
        <Loader2 size={14} className="animate-spin text-wellness-green" />
        <span>Searching therapeutics & catalog...</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="px-4 py-4 text-xs font-semibold text-wellness-charcoal/60 text-center">
        No quick suggestions found for &ldquo;
        <span className="text-wellness-navy font-bold">{searchQuery}</span>&rdquo;
      </div>
    );
  }

  return (
    <div className="divide-y divide-wellness-gray-100/70">
      {/* Product suggestions */}
      {suggestions.some((s) => s.type === 'product') && (
        <div className="py-1">
          <div className="px-4 py-1.5 text-[9px] font-black text-wellness-charcoal/40 uppercase tracking-widest flex items-center gap-1.5">
            <Pill size={10} className="text-wellness-green" />
            <span>Products</span>
          </div>
          {suggestions
            .filter((s) => s.type === 'product')
            .map((item) => {
              const itemIndex = suggestions.findIndex((s) => s.id === item.id);
              const isFocused = itemIndex === focusedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSuggestionClick(item);
                  }}
                  onMouseEnter={() => {
                    setFocusedIndex(itemIndex);
                  }}
                  className={clsx(
                    'w-full px-4 py-2 flex items-center gap-3 transition-colors text-left group cursor-pointer',
                    isFocused
                      ? 'bg-wellness-green/10 text-wellness-navy'
                      : 'hover:bg-wellness-gray-100/70 text-wellness-navy',
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-wellness-gray-100 relative overflow-hidden flex items-center justify-center shrink-0 border border-wellness-gray-200/60">
                    {item.image ? (
                      <Image src={item.image} alt={item.label} fill className="object-cover" />
                    ) : (
                      <Pill size={14} className="text-wellness-green/70" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate group-hover:text-wellness-green transition-colors">
                      {item.label}
                    </p>
                  </div>
                  {item.price && (
                    <span className="text-[11px] font-extrabold text-wellness-green shrink-0">
                      ₹{item.price}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      )}

      {/* Category suggestions */}
      {suggestions.some((s) => s.type === 'category') && (
        <div className="py-1">
          <div className="px-4 py-1.5 text-[9px] font-black text-wellness-charcoal/40 uppercase tracking-widest flex items-center gap-1.5">
            <Tag size={10} className="text-wellness-navy/60" />
            <span>Categories</span>
          </div>
          {suggestions
            .filter((s) => s.type === 'category')
            .map((item) => {
              const itemIndex = suggestions.findIndex((s) => s.id === item.id);
              const isFocused = itemIndex === focusedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSuggestionClick(item);
                  }}
                  onMouseEnter={() => {
                    setFocusedIndex(itemIndex);
                  }}
                  className={clsx(
                    'w-full px-4 py-2 flex items-center gap-2.5 transition-colors text-left group cursor-pointer',
                    isFocused
                      ? 'bg-wellness-green/10 text-wellness-navy'
                      : 'hover:bg-wellness-gray-100/70 text-wellness-navy',
                  )}
                >
                  <Tag size={12} className="text-wellness-green shrink-0" />
                  <span className="text-xs font-bold flex-1 truncate group-hover:text-wellness-green transition-colors">
                    {item.label}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-wellness-charcoal/40 bg-wellness-gray-100 px-2 py-0.5 rounded">
                    Category
                  </span>
                </button>
              );
            })}
        </div>
      )}

      {/* View All Footer */}
      <button
        type="button"
        onClick={onViewAll}
        className="w-full px-4 py-2.5 bg-wellness-navy/5 hover:bg-wellness-navy hover:text-white transition-colors text-xs font-bold text-wellness-navy flex items-center justify-between group cursor-pointer"
      >
        <span>Search for &ldquo;{searchQuery}&rdquo;</span>
        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
