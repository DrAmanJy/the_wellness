'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowRight, Wind, Baby, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const banners = [
  {
    tag: 'Up to 25% Off',
    title: 'Safe Pediatric Suspension',
    desc: 'Gentle fever and pain relief formulated specifically for infants.',
    link: '/products?category=Pediatrics',
    bg: 'from-indigo-950 to-indigo-800 border-indigo-700/30',
    icon: Baby,
    glow: 'bg-indigo-500/20',
  },
  {
    tag: 'Prescription Care',
    title: 'Advanced Inhalers & COPD',
    desc: 'Metered-dose suspensions for rapid bronchodilation and lung care.',
    link: '/products?category=Respiratory',
    bg: 'from-teal-950 to-teal-800 border-teal-700/30',
    icon: Wind,
    glow: 'bg-teal-500/20',
  },
  {
    tag: 'Clinical Strength OTC',
    title: 'Osteo Joint Formulations',
    desc: 'Joint support and cartilage matrix repair with high bioavailability.',
    link: '/products?category=OTC%20%26%20Wellness',
    bg: 'from-wellness-navy to-[#183153] border-wellness-navy/35',
    icon: Sparkles,
    glow: 'bg-wellness-green/20',
  },
];

export default function PromoBanners() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        gsap.from('.promo-banner-card', {
          scrollTrigger: {
            trigger: '.promo-grid',
            start: 'top 85%',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });
      }, container);

      return () => {
        ctx.revert();
      };
    },
    { scope: container },
  );

  return (
    <section ref={container} className="py-20 bg-white border-b border-wellness-gray-200">
      <div className="container mx-auto px-6 md:px-12">
        {/* Banners Grid */}
        <div className="promo-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
          {banners.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className={`promo-banner-card group relative overflow-hidden rounded-[32px] p-8 border bg-gradient-to-br ${item.bg} text-white flex flex-col justify-between min-h-[280px] shadow-lg`}
              >
                {/* Glowing Orb Overlay */}
                <div
                  className={`absolute -right-12 -top-12 w-40 h-40 rounded-full blur-2xl pointer-events-none -z-10 ${item.glow}`}
                ></div>

                {/* Top Text Details */}
                <div className="space-y-4">
                  <span className="inline-block bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                    {item.tag}
                  </span>

                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-heading font-bold leading-tight tracking-tight max-w-[200px]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/70 font-semibold leading-relaxed max-w-[220px]">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom CTA & Icon */}
                <div className="flex justify-between items-end mt-6">
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1.5 bg-white text-wellness-navy text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-wellness-green hover:text-white transition-all duration-300"
                  >
                    <span>Shop Now</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>

                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <IconComponent size={24} className="stroke-[1.8]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
