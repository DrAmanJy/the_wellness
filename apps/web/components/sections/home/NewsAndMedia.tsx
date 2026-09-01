'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const news = [
  {
    id: 1,
    category: 'Corporate',
    date: 'August 12, 2026',
    title: 'The Wellness Expands State-of-the-Art Manufacturing Facility in Europe',
    image:
      'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 2,
    category: 'R&D',
    date: 'July 28, 2026',
    title: 'Breakthrough Clinical Trial Results Announced for Next-Gen Respiratory Inhaler',
    image:
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3,
    category: 'CSR',
    date: 'July 15, 2026',
    title: 'Global Health Initiative: Reaching 1 Million Patients in Underserved Communities',
    image:
      'https://images.unsplash.com/photo-1584515906207-50c5d63d2744?auto=format&fit=crop&q=80&w=600',
  },
];

export default function NewsAndMedia() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        gsap.from('.news-header', {
          scrollTrigger: { trigger: '.news-header', start: 'top 85%' },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });

        gsap.from('.news-card', {
          scrollTrigger: { trigger: '.news-grid', start: 'top 80%' },
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
    <section ref={container} className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="news-header flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-sm font-bold text-wellness-green uppercase tracking-wider mb-3">
              Media Center
            </h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold text-wellness-navy tracking-tight">
              Latest News & Updates
            </h3>
          </div>
          <Link
            href="/media"
            className="group flex items-center gap-2 text-wellness-navy font-semibold hover:text-wellness-green transition-colors pb-2 border-b-2 border-wellness-navy hover:border-wellness-green"
          >
            View all news
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="news-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
            <Link key={item.id} href={`/media/${item.id}`} className="news-card group block">
              <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-6">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-wellness-navy uppercase tracking-wider">
                  {item.category}
                </div>
              </div>
              <p className="text-sm font-medium text-wellness-charcoal/60 mb-3">{item.date}</p>
              <h4 className="text-xl font-heading font-bold text-wellness-navy group-hover:text-wellness-green transition-colors line-clamp-3">
                {item.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
