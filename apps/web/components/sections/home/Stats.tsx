'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  { value: '20', suffix: '+', label: 'Years of Expertise' },
  { value: '50', suffix: '+', label: 'Healthcare Products' },
  { value: '10', suffix: '+', label: 'Global Markets' },
  { value: '100', suffix: '%', label: 'Quality First' },
];

export default function Stats() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        const numbers = gsap.utils.toArray<HTMLElement>('.stat-value');

        gsap.from('.stat-item', {
          scrollTrigger: {
            trigger: container.current,
            start: 'top 80%',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        });

        numbers.forEach((num) => {
          const targetValue = parseInt(num.getAttribute('data-value') || '0', 10);

          gsap.to(num, {
            scrollTrigger: {
              trigger: container.current,
              start: 'top 80%',
            },
            innerHTML: targetValue,
            duration: 2,
            ease: 'power2.out',
            snap: { innerHTML: 1 },
            onUpdate() {
              num.innerHTML = String(Math.round(parseFloat(num.innerHTML) || 0));
            },
          });
        });
      }, container);

      return () => {
        ctx.revert();
      };
    },
    { scope: container },
  );

  return (
    <section ref={container} className="py-24 bg-wellness-navy text-white relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 divide-x divide-white/10">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item flex flex-col items-center text-center px-4">
              <div className="text-4xl md:text-6xl font-heading font-bold text-wellness-light-green mb-2 flex">
                <span className="stat-value" data-value={stat.value}>
                  0
                </span>
                <span>{stat.suffix}</span>
              </div>
              <p className="text-wellness-light-green/70 text-sm md:text-base font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
    </section>
  );
}
