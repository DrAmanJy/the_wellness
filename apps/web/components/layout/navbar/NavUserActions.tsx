'use client';

import { Menu, ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface NavUserActionsProps {
  cartCount: number;
  toggleCart: () => void;
  session: unknown;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function NavUserActions({
  cartCount,
  toggleCart,
  session,
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavUserActionsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
      {/* Cart Drawer Toggle */}
      <button
        onClick={toggleCart}
        className="relative p-2 rounded-full text-wellness-navy hover:bg-wellness-gray-100 transition-colors cursor-pointer group"
        aria-label="Open Cart"
      >
        <ShoppingBag size={20} className="group-hover:scale-105 transition-transform" />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-wellness-green text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
            {cartCount}
          </span>
        )}
      </button>

      {/* Account Portal Link */}
      {session ? (
        <Link
          href="/account"
          className="relative p-2 rounded-full text-wellness-navy hover:bg-wellness-gray-100 transition-colors cursor-pointer group hidden sm:inline-flex"
          aria-label="Account Settings"
        >
          <User size={20} className="group-hover:scale-105 transition-transform" />
        </Link>
      ) : (
        <Link
          href="/account"
          className="hidden sm:inline-flex items-center justify-center bg-wellness-navy hover:bg-wellness-green text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-sm border border-transparent"
        >
          Login
        </Link>
      )}

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden p-2 text-wellness-navy hover:bg-wellness-gray-100 rounded-full transition-colors cursor-pointer"
        onClick={() => {
          setMobileMenuOpen(!mobileMenuOpen);
        }}
        aria-label="Toggle Menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}
