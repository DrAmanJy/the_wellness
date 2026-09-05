'use client';

import clsx from 'clsx';
import { ChevronDown, Flame } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

import { categories, navLinks } from './types';

interface NavDesktopBarProps {
  pathname: string;
  categoryDropdownOpen: boolean;
  setCategoryDropdownOpen: (open: boolean) => void;
  onSelectCategory: (category: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function NavDesktopBar({
  pathname,
  categoryDropdownOpen,
  setCategoryDropdownOpen,
  onSelectCategory,
  dropdownRef,
}: NavDesktopBarProps) {
  return (
    <div className="bg-wellness-white border-t border-wellness-gray-200 py-2 hidden md:block w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex items-center justify-between">
        {/* Categories Selector Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
            }}
            className="flex items-center gap-2 bg-wellness-navy hover:bg-wellness-green text-white text-xs font-extrabold uppercase tracking-wider py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <span>All Categories</span>
            <ChevronDown
              size={14}
              className={clsx(
                'transition-transform duration-300',
                categoryDropdownOpen && 'rotate-180',
              )}
            />
          </button>

          {/* Dropdown Box */}
          <AnimatePresence>
            {categoryDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 mt-2 w-64 bg-white border border-wellness-gray-200 rounded-xl shadow-xl z-[120] py-2 overflow-hidden"
              >
                <div className="px-4 py-2 text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest border-b border-wellness-gray-100 mb-1">
                  Product Categories
                </div>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onSelectCategory(category);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-wellness-gray-100 hover:text-wellness-green text-xs font-bold text-wellness-navy transition-colors cursor-pointer"
                  >
                    {category}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center Main Nav Links */}
        <nav className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  'text-xs uppercase tracking-wider font-extrabold transition-colors duration-300 relative py-1 group',
                  isActive ? 'text-wellness-green' : 'text-wellness-navy hover:text-wellness-green',
                )}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-wellness-green rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Promo Link */}
        <Link
          href="/products?category=OTC%20%26%20Wellness"
          className="flex items-center gap-1.5 text-red-500 text-xs font-extrabold uppercase tracking-wider hover:text-wellness-navy transition-colors animate-pulse"
        >
          <Flame size={14} />
          <span>Daily Deals</span>
        </Link>
      </div>
    </div>
  );
}
