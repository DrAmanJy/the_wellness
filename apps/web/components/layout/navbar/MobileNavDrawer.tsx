'use client';

import { User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

import NavbarSearch from './NavbarSearch';
import { categories, navLinks } from './types';
import type { SearchSuggestionItem } from './types';

interface MobileNavDrawerProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
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
  onSelectCategory: (category: string) => void;
  session: unknown;
  mobileSearchContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function MobileNavDrawer({
  mobileMenuOpen,
  setMobileMenuOpen,
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
  onSelectCategory,
  session,
  mobileSearchContainerRef,
}: MobileNavDrawerProps) {
  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed left-0 right-0 bottom-0 top-[var(--header-height,110px)] z-[95] bg-white px-6 pb-6 pt-6 flex flex-col h-[calc(100dvh-var(--header-height,110px))] overflow-y-auto border-t border-wellness-gray-200"
        >
          {/* Search Input for Mobile */}
          <NavbarSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            suggestions={suggestions}
            isLoadingSuggestions={isLoadingSuggestions}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            focusedIndex={focusedIndex}
            setFocusedIndex={setFocusedIndex}
            onSearchSubmit={onSearchSubmit}
            onSuggestionClick={onSuggestionClick}
            onKeyDown={onKeyDown}
            containerRef={mobileSearchContainerRef}
            isMobile
          />

          {/* Quick Actions (Mobile only) */}
          <div className="flex flex-col gap-3 mb-6 sm:hidden">
            <div className="text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest border-b border-wellness-gray-100 pb-1">
              Quick Actions
            </div>

            {session ? (
              <Link
                href="/account"
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 text-sm font-bold text-wellness-navy hover:text-wellness-green transition-colors border-b border-wellness-gray-100/50 pb-2.5"
              >
                <User size={16} className="text-wellness-navy/70" />
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                href="/account"
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 text-sm font-bold text-wellness-navy hover:text-wellness-green transition-colors border-b border-wellness-gray-100/50 pb-2.5"
              >
                <User size={16} className="text-wellness-navy/70" />
                <span>Login / Register</span>
              </Link>
            )}
          </div>

          {/* Menu Links */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest border-b border-wellness-gray-100 pb-1">
              Main Menu
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-bold text-wellness-navy hover:text-wellness-green transition-colors border-b border-wellness-gray-100/50 pb-2.5"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Categories Links */}
          <div className="flex flex-col gap-3.5 mb-8">
            <div className="text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest border-b border-wellness-gray-100 pb-1">
              Shop By Category
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                  }}
                  className="text-left px-3 py-2 bg-wellness-gray-100 rounded-lg text-xs font-bold text-wellness-navy hover:bg-wellness-light-green transition-all"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Info footer in mobile */}
          <div className="mt-auto pt-6 border-t border-wellness-gray-100 text-center text-xs text-wellness-charcoal/50">
            <p>Call Center: 1-800-WELLNESS</p>
            <p className="mt-1">support@thewellness.com</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
