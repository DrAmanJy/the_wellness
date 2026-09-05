'use client';

import Image from 'next/image';
import React from 'react';

interface ProductHeroBannerProps {
  activeCategory: string;
}

export default function ProductHeroBanner({ activeCategory }: ProductHeroBannerProps) {
  return (
    <div className="relative w-full h-[420px] sm:h-[460px] md:h-[520px] overflow-hidden bg-wellness-navy">
      <Image
        src="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1600"
        alt="Premium laboratory formulations and amber dropper bottles"
        fill
        priority
        className="object-cover object-center brightness-[0.60]"
      />
      {/* Soft premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-wellness-navy via-wellness-navy/50 to-transparent"></div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-start sm:justify-center text-center p-4 pt-10 sm:pt-8 md:pt-10 pb-28 sm:pb-32">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-wellness-green bg-wellness-green/15 border border-wellness-green/30 px-4 py-1.5 rounded-full mb-2 backdrop-blur-md shadow-sm">
          Apothecary & Product Catalog
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[7.5rem] font-heading font-black text-white tracking-[0.03em] uppercase select-none leading-tight transition-all duration-300 max-w-full px-4 truncate">
          {activeCategory === 'All' ? 'Shop' : activeCategory}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-lg font-medium mt-3 leading-relaxed drop-shadow-sm px-4">
          Explore our certified clinical treatments, premium therapeutics, and evidence-based
          formulations.
        </p>
      </div>
    </div>
  );
}
