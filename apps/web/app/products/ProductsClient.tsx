'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Search,
  X,
  ShoppingCart,
  Eye,
  Filter,
  Heart,
  Star,
  RotateCcw,
  ShieldCheck,
  Clock,
  Truck,
  Headphones,
  Sparkles,
  FolderOpen,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  ShieldAlert,
  Pill,
  ChevronRight,
  Percent,
  Activity,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/lib/products';

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';

  const [categories, setCategories] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [activeType, setActiveType] = useState<'All' | 'Prescription' | 'OTC'>('All');
  const [activePrice, setActivePrice] = useState<'All' | 'under-2000' | '2000-5000' | 'above-5000'>(
    'All',
  );
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<'All' | 'new' | 'best' | 'discount'>(
    'All',
  );

  const { addToCart } = useCart();
  const { toggleProductInWishlist, isInWishlist } = useWishlist();
  const gridRef = useRef<HTMLDivElement>(null);

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

  // Initialize categories and products from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('admin_products');
    let currentProducts = initialProducts;
    if (savedProducts) {
      try {
        currentProducts = JSON.parse(savedProducts) as Product[];
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('admin_products', JSON.stringify(initialProducts));
    }
    setProductsList(currentProducts);

    const savedCategories = localStorage.getItem('admin_categories');
    let currentCategories: string[] = [];
    if (savedCategories) {
      try {
        currentCategories = JSON.parse(savedCategories) as string[];
      } catch (e) {
        console.error(e);
      }
    } else {
      const uniqueCats = Array.from(new Set(currentProducts.map((p) => p.category)));
      currentCategories = ['All', ...uniqueCats];
      localStorage.setItem('admin_categories', JSON.stringify(currentCategories));
    }
    setCategories(currentCategories);
  }, [initialProducts]);

  // Sync search query from URL params
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Sync category filter & search query & price/type filters
  useEffect(() => {
    setActiveCategory(categoryParam);

    let temp = productsList;
    if (categoryParam !== 'All') {
      temp = temp.filter((p) => p.category === categoryParam);
    }

    if (activeType === 'Prescription') {
      temp = temp.filter((p) => p.type === 'Prescription (Rx)');
    } else if (activeType === 'OTC') {
      temp = temp.filter((p) => p.type === 'Over-The-Counter (OTC)');
    }

    if (activePrice === 'under-2000') {
      temp = temp.filter((p) => p.price < 2000);
    } else if (activePrice === '2000-5000') {
      temp = temp.filter((p) => p.price >= 2000 && p.price <= 5000);
    } else if (activePrice === 'above-5000') {
      temp = temp.filter((p) => p.price > 5000);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      temp = temp.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.ingredients.some((ing) => ing.toLowerCase().includes(query)),
      );
    }

    // Apply active highlight sorting/filtering
    if (activeHighlight === 'new') {
      temp = [...temp].reverse();
    } else if (activeHighlight === 'best') {
      temp = temp.filter((_, idx) => idx % 2 === 0);
    } else if (activeHighlight === 'discount') {
      temp = temp.filter((p) => p.price < 4000);
    }

    setFilteredProducts(temp);
  }, [categoryParam, searchQuery, productsList, activeType, activePrice, activeHighlight]);

  useGSAP(() => {
    // Staggered grid entry animation on load/filter
    if (gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      );
    }
  }, [filteredProducts]);

  const handleCategoryChange = (category: string) => {
    router.push(
      `/products${category === 'All' ? '' : `?category=${encodeURIComponent(category)}`}`,
      { scroll: false },
    );
  };

  const getCategoryCount = (category: string) => {
    if (category === 'All') return productsList.length;
    return productsList.filter((p) => p.category === category).length;
  };

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen">
      {/* 1. Hero Header Banner */}
      <div className="relative w-full h-[360px] md:h-[480px] overflow-hidden bg-wellness-navy">
        <Image
          src="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1600"
          alt="Premium laboratory formulations and amber dropper bottles"
          fill
          priority
          className="object-cover object-center brightness-[0.70]"
        />
        {/* Soft premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-wellness-navy/90 via-wellness-navy/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-wellness-green bg-wellness-green/10 border border-wellness-green/20 px-4 py-1.5 rounded-full mb-3 backdrop-blur-sm">
            Apothecary & Therapeutics
          </span>
          <h1 className="text-7xl sm:text-8xl md:text-[11rem] font-heading font-black text-white tracking-[0.05em] uppercase select-none leading-none mt-[-10px]">
            Shop
          </h1>
          <p className="text-xs sm:text-sm text-wellness-light-green/75 max-w-md font-bold mt-4 leading-relaxed">
            Explore our certified clinical treatments, premium therapeutics, and evidence-based
            formulations.
          </p>
        </div>
      </div>

      {/* 2. Main Overlapping Content Overlay */}
      <div className="relative z-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 pb-24">
        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-[0_20px_60px_rgba(12,27,51,0.06)] p-6 sm:p-10 border border-wellness-gray-200/50">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Sidebar Filter Section */}
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
                  {(activeCategory !== 'All' ||
                    activeType !== 'All' ||
                    activePrice !== 'All' ||
                    activeHighlight !== 'All' ||
                    searchQuery.trim() !== '') && (
                    <button
                      onClick={() => {
                        setActiveCategory('All');
                        setActiveType('All');
                        setActivePrice('All');
                        setActiveHighlight('All');
                        setSearchQuery('');
                        router.push('/products', { scroll: false });
                      }}
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
                        handleCategoryChange('All');
                        setActiveHighlight('All');
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
                                  handleCategoryChange(category);
                                  setActiveHighlight('All');
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
                          setActiveCategory('All');
                          setActiveHighlight('new');
                          router.push('/products', { scroll: false });
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
                          setActiveCategory('All');
                          setActiveHighlight('best');
                          router.push('/products', { scroll: false });
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
                          setActiveCategory('All');
                          setActiveHighlight('discount');
                          router.push('/products', { scroll: false });
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
                              setActiveType(type);
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
                                  className={
                                    isActive ? 'text-wellness-green' : 'text-wellness-charcoal/40'
                                  }
                                />
                              ) : type === 'Prescription' ? (
                                <ShieldCheck
                                  size={13}
                                  className={
                                    isActive ? 'text-wellness-green' : 'text-wellness-charcoal/40'
                                  }
                                />
                              ) : (
                                <Sparkles
                                  size={13}
                                  className={
                                    isActive ? 'text-wellness-green' : 'text-wellness-charcoal/40'
                                  }
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
                              setActivePrice(item.key);
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

            {/* Right Content Section */}
            <div className="flex-grow flex flex-col">
              {/* Dynamic Search & Items Summary */}
              <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-wellness-gray-200 shadow-sm">
                <div className="relative w-full sm:max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-wellness-charcoal/40">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Search products, ingredients, symptoms..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-wellness-gray-200 bg-wellness-white text-xs font-semibold focus:outline-none focus:border-wellness-green focus:ring-1 focus:ring-wellness-green transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                      }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-wellness-charcoal/40 hover:text-wellness-navy"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="text-[10px] font-bold text-wellness-charcoal/40 uppercase tracking-widest bg-wellness-gray-100 px-3 py-1.5 rounded-lg border border-wellness-gray-200/50">
                  Showing {filteredProducts.length}{' '}
                  {filteredProducts.length === 1 ? 'product' : 'products'}
                </div>
              </div>

              {/* Catalog Grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-24 text-center text-wellness-charcoal/50 bg-white rounded-2xl border border-wellness-gray-200 shadow-sm flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-wellness-gray-100 flex items-center justify-center mb-4 text-wellness-charcoal/30">
                    <Search size={24} />
                  </div>
                  <p className="text-base font-bold text-wellness-navy">No products found</p>
                  <p className="text-xs text-wellness-charcoal/60 mt-1 max-w-xs">
                    Try adjusting your search criteria or resetting the therapeutic category
                    filters.
                  </p>
                </div>
              ) : (
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group block bg-white border border-wellness-gray-200/80 rounded-[24px] overflow-hidden hover:shadow-[0_20px_50px_rgba(10,25,47,0.08)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full relative"
                    >
                      {/* Card Image Area with Full Size Product Image */}
                      <div className="relative aspect-square bg-[#F8F9FA] overflow-hidden shrink-0 border-b border-wellness-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />

                        {/* Type Badge */}
                        <div className="absolute top-4 left-4 z-20">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${
                              product.type === 'Prescription (Rx)'
                                ? 'bg-red-50/90 backdrop-blur-sm text-red-600 border border-red-100'
                                : 'bg-wellness-navy/90 backdrop-blur-sm text-white'
                            }`}
                          >
                            {product.type}
                          </span>
                        </div>

                        {/* Wishlist toggle button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleProductInWishlist(product);
                          }}
                          className="absolute top-4 right-4 z-20 w-8.5 h-8.5 rounded-full bg-white/90 backdrop-blur-sm border border-wellness-gray-200/50 flex items-center justify-center text-wellness-navy hover:text-red-500 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer group/wishlist"
                          aria-label="Toggle Wishlist"
                        >
                          <Heart
                            size={15}
                            className={
                              isInWishlist(product.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-wellness-navy group-hover/wishlist:text-red-500'
                            }
                          />
                        </button>
                      </div>

                      {/* Card Content Area */}
                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div className="space-y-2">
                          {/* Category & Rating */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-extrabold tracking-widest uppercase text-wellness-green bg-wellness-green/5 px-2.5 py-1 rounded">
                              {product.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star size={11} className="fill-amber-500 text-amber-500" />
                              <span className="text-[10px] font-black text-wellness-navy">4.9</span>
                              <span className="text-[9px] text-wellness-charcoal/40 font-bold">
                                (120)
                              </span>
                            </div>
                          </div>

                          {/* Product Name */}
                          <h4 className="text-base font-heading font-black text-wellness-navy group-hover:text-wellness-green transition-colors line-clamp-1">
                            <Link href={`/products/${product.id}`}>{product.name}</Link>
                          </h4>

                          {/* Product Description */}
                          <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-semibold line-clamp-2">
                            {product.description}
                          </p>

                          {/* Active Ingredients list */}
                          <div className="pt-2 text-[10px] text-wellness-charcoal/40 font-semibold truncate">
                            <span className="font-extrabold uppercase tracking-widest text-wellness-charcoal/30 mr-1.5">
                              Ingredients:
                            </span>
                            {product.ingredients.join(', ')}
                          </div>
                        </div>

                        {/* Price and Action Buttons at Bottom */}
                        <div className="mt-5">
                          <div className="flex items-baseline justify-between mb-4 border-t border-wellness-gray-100 pt-4">
                            <span className="text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest">
                              Treatment cost
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-wellness-charcoal/40 line-through font-bold">
                                ₹{(product.price * 1.15).toFixed(0)}
                              </span>
                              <span className="text-lg font-black text-wellness-navy">
                                ₹{product.price.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Visible Dual Buttons */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <Link
                              href={`/products/${product.id}`}
                              className="py-3 px-2 border border-wellness-gray-200 hover:border-wellness-navy bg-white hover:bg-wellness-navy hover:text-white text-[10px] font-extrabold uppercase tracking-widest text-wellness-navy text-center rounded-xl transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Eye size={12} className="stroke-[2.5]" />
                              <span>Details</span>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                              className="py-3 px-2 bg-wellness-green hover:bg-wellness-navy text-white text-[10px] font-extrabold uppercase tracking-widest text-center rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <ShoppingCart size={12} className="stroke-[2.5]" />
                              <span>Quick Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-24 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-wellness-navy via-[#0C1B33] to-wellness-navy p-8 md:p-12 border border-white/5">
          <div className="absolute right-0 top-0 w-80 h-80 bg-wellness-green/10 glow-orb opacity-50"></div>
          <div className="absolute left-[-10%] bottom-0 w-64 h-64 bg-wellness-light-green/5 glow-orb opacity-20"></div>

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-wellness-green">
              <Sparkles size={12} />
              Stay Informed
            </div>
            <h3 className="text-2xl md:text-3xl font-heading font-black text-white uppercase tracking-tight">
              Subscribe to Clinical Updates
            </h3>
            <p className="text-xs md:text-sm text-wellness-light-green/77 leading-relaxed font-bold">
              Get notified about clinical research, new therapeutics, and regulatory approvals. Join
              our network of healthcare practitioners and patients.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Successfully subscribed to updates!');
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                required
                placeholder="Enter your professional email address"
                className="flex-grow px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-wellness-green focus:ring-1 focus:ring-wellness-green transition-all font-semibold"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-wellness-green hover:bg-white hover:text-wellness-navy text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-wellness-gray-200 pt-16 pb-8">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-wellness-navy/5 flex items-center justify-center text-wellness-navy shrink-0 border border-wellness-navy/5">
              <Truck size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-wellness-navy">
                Priority Dispensing
              </h4>
              <p className="text-[11px] text-wellness-charcoal/60 font-semibold leading-relaxed font-medium">
                Same-day clinical verification and cold-chain shipping.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-wellness-navy/5 flex items-center justify-center text-wellness-navy shrink-0 border border-wellness-navy/5">
              <ShieldCheck size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-wellness-navy">
                Certified GMP Products
              </h4>
              <p className="text-[11px] text-wellness-charcoal/60 font-semibold leading-relaxed font-medium">
                100% compliant with World Health Organization GMP.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-wellness-navy/5 flex items-center justify-center text-wellness-navy shrink-0 border border-wellness-navy/5">
              <Clock size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-wellness-navy">
                Real-time Expiry Sync
              </h4>
              <p className="text-[11px] text-wellness-charcoal/60 font-semibold leading-relaxed font-medium">
                Automated notifications for batch shelf-life updates.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-wellness-navy/5 flex items-center justify-center text-wellness-navy shrink-0 border border-wellness-navy/5">
              <Headphones size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-wellness-navy">
                Clinical Support Desk
              </h4>
              <p className="text-[11px] text-wellness-charcoal/60 font-semibold leading-relaxed font-medium">
                Direct access to certified pharmacists and specialists.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
