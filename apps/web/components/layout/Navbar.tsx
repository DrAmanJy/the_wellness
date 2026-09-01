'use client';

import clsx from 'clsx';
import { Menu, X, ShoppingBag, User, Heart, Search, ChevronDown, Flame } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { authClient } from '@/lib/auth-client';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Shop Products', href: '/products' },
  { name: 'About Us', href: '/about' },
  { name: 'R&D Focus', href: '/research' },
  { name: 'Quality Standards', href: '/quality' },
  { name: 'Contact Us', href: '/contact' },
];

const categories = [
  'Respiratory',
  'Cardiovascular',
  'Neurology',
  'Anti-Infectives',
  'OTC & Wellness',
  'Pediatrics',
];

const announcements = [
  {
    badge: 'Limited Offer',
    text: 'Save 20% on your first order with code',
    code: 'WELLNESS20',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    badge: 'Free Shipping',
    text: 'Free express shipping on medical catalog above',
    code: '₹1,999',
    cta: 'Claim Offer',
    link: '/products',
  },
  {
    badge: 'R&D Labs',
    text: 'Discover our certified formulations and clinical quality',
    code: 'WHO-GMP',
    cta: 'Our Process',
    link: '/quality',
  },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toggleCart, cartCount } = useCart();
  const { toggleWishlist, wishlistCount } = useWishlist();
  const { data: session } = authClient.useSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [currentAnnouncementIdx, setCurrentAnnouncementIdx] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);

  // Check localStorage for banner state on mount
  useEffect(() => {
    const bannerClosed = localStorage.getItem('offer_banner_closed');
    if (!bannerClosed) {
      setShowBanner(true);
    }
  }, []);

  // Interval for cycling announcements
  useEffect(() => {
    if (!showBanner) return;
    const interval = setInterval(() => {
      setCurrentAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [showBanner]);

  // Dynamically set --header-height CSS variable on mount and resize
  useEffect(() => {
    if (!headerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.borderBoxSize[0]
          ? entry.borderBoxSize[0].blockSize
          : entry.contentRect.height;
        document.documentElement.style.setProperty('--header-height', String(height) + 'px');
      }
    });

    observer.observe(headerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Sync search input with URL if we are on the products page
  useEffect(() => {
    if (pathname === '/products') {
      setSearchQuery(searchParams.get('search') || '');
    }
  }, [searchParams, pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const selectCategory = (category: string) => {
    setCategoryDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-[100] w-full flex flex-col border-b border-wellness-gray-200 bg-white shadow-sm"
    >
      {/* Promo Offer Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-gradient-to-r from-wellness-navy via-[#1E5C5A] to-wellness-green text-white relative overflow-hidden shrink-0 animate-gradient-shift border-b border-white/5 shadow-sm"
          >
            <div className="h-10 max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center w-full relative">
              {/* Cycling Announcement Carousel */}
              <div className="flex-1 flex justify-center items-center h-full px-8 sm:px-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentAnnouncementIdx}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex items-center justify-center gap-1.5 sm:gap-3 text-xs w-full"
                  >
                    <span className="hidden sm:inline-flex bg-wellness-light-green/20 text-wellness-light-green text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded border border-wellness-light-green/20 shadow-sm select-none shrink-0 animate-pulse">
                      {announcements[currentAnnouncementIdx].badge}
                    </span>
                    <Link
                      href={announcements[currentAnnouncementIdx].link}
                      className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-wellness-light-green/95 hover:text-white font-semibold transition-colors truncate max-w-full"
                    >
                      <span className="truncate">{announcements[currentAnnouncementIdx].text}</span>
                      <span className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[9px] sm:text-[10px] border border-white/10 font-bold shrink-0">
                        {announcements[currentAnnouncementIdx].code}
                      </span>
                    </Link>
                    <Link
                      href={announcements[currentAnnouncementIdx].link}
                      className="hidden md:inline-flex text-white hover:text-wellness-light-green underline underline-offset-4 text-xs font-extrabold transition-colors shrink-0 group items-center gap-1"
                    >
                      <span>{announcements[currentAnnouncementIdx].cta}</span>
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowBanner(false);
                  localStorage.setItem('offer_banner_closed', 'true');
                }}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer absolute right-2 sm:right-8"
                aria-label="Close Announcement"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 2. Main Header Middle Bar */}
      <div className="bg-white py-4 w-full">
        <div className="px-6 md:px-12 flex items-center justify-between gap-6 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-heading font-black tracking-tight flex items-center gap-2 group/logo text-wellness-navy shrink-0"
          >
            <div className="w-8 h-8 rounded-bl-xl rounded-tr-xl bg-wellness-green flex items-center justify-center transition-all duration-500 group-hover/logo:rotate-180 group-hover/logo:bg-wellness-navy shadow-md shadow-wellness-green/20">
              <div className="w-3 h-3 rounded-full bg-white transition-transform duration-500 group-hover/logo:scale-75"></div>
            </div>
            <span>
              The Wellness<span className="text-wellness-green font-medium">.</span>
            </span>
          </Link>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-stretch"
          >
            <input
              type="text"
              placeholder="Search for therapeutics, generic medicines, ingredients..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-wellness-gray-200 text-xs font-semibold focus:outline-none focus:border-wellness-green focus:ring-1 focus:ring-wellness-green bg-[#FAF8F5]/80 focus:bg-white transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-wellness-charcoal/50 hover:text-wellness-green transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </form>

          {/* User, Wishlist, Cart Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Wishlist Button */}
            <button
              onClick={toggleWishlist}
              className="relative p-2 rounded-full text-wellness-navy hover:bg-wellness-gray-100 transition-colors cursor-pointer group hidden sm:inline-flex"
              aria-label="Favorites"
            >
              <Heart size={20} className="group-hover:scale-105 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-wellness-navy text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

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
        </div>
      </div>

      {/* 3. Bottom Navigation & Categories Bar */}
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
                    Therapeutic Categories
                  </div>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        selectCategory(category);
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
                    isActive
                      ? 'text-wellness-green'
                      : 'text-wellness-navy hover:text-wellness-green',
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

      {/* 4. Mobile Menu Drawer */}
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
            <form onSubmit={handleSearchSubmit} className="flex mb-6 w-full relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full px-4 py-2.5 rounded-l-xl border border-wellness-gray-200 text-xs font-semibold focus:outline-none"
              />
              <button
                type="submit"
                className="bg-wellness-navy text-white px-5 rounded-r-xl flex items-center justify-center border border-transparent"
              >
                <Search size={16} />
              </button>
            </form>

            {/* Quick Actions (Mobile only) */}
            <div className="flex flex-col gap-3 mb-6 sm:hidden">
              <div className="text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest border-b border-wellness-gray-100 pb-1">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleWishlist();
                }}
                className="flex items-center gap-3 text-sm font-bold text-wellness-navy hover:text-wellness-green transition-colors border-b border-wellness-gray-100/50 pb-2.5 text-left cursor-pointer"
              >
                <Heart size={16} className="text-wellness-navy/70" />
                <span>My Wishlist ({wishlistCount})</span>
              </button>
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
                      selectCategory(cat);
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
    </header>
  );
}
