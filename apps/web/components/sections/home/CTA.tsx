'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Link from 'next/link';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CTA() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        gsap.from('.cta-content', {
          scrollTrigger: {
            trigger: container.current,
            start: 'top 75%',
          },
          y: 40,
          opacity: 0,
          duration: 1,
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
    <section ref={container} className="py-32 bg-wellness-green relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
        <div className="cta-content max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-10 tracking-tight leading-tight">
            Building a healthier tomorrow, today.
          </h2>
          <Link
            href="/products"
            className="inline-block bg-white text-wellness-navy px-10 py-5 rounded-full text-lg font-medium hover:bg-wellness-navy hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Explore Our Products
          </Link>
        </div>
      </div>

      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -z-0 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-wellness-navy/10 rounded-full blur-3xl -z-0 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
    </section>
  );
}
