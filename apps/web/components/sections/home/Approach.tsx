'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Image from 'next/image';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const approaches = [
  {
    title: 'Research',
    description:
      'Every product begins with rigorous scientific literature review and clinical data analysis.',
    number: '01',
  },
  {
    title: 'Innovation',
    description:
      'We develop novel delivery mechanisms to ensure maximum bioavailability and effectiveness.',
    number: '02',
  },
  {
    title: 'Quality',
    description:
      'Our facilities exceed cGMP standards, with multi-stage testing for purity and potency.',
    number: '03',
  },
  {
    title: 'Better Outcomes',
    description:
      'The final result is a premium product that delivers measurable improvements to your health.',
    number: '04',
  },
];

export default function Approach() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        gsap.from('.approach-title', {
          scrollTrigger: {
            trigger: '.approach-header',
            start: 'top 80%',
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });

        gsap.from('.approach-item', {
          scrollTrigger: {
            trigger: '.approach-grid',
            start: 'top 70%',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });

        gsap.from('.approach-image', {
          scrollTrigger: {
            trigger: '.approach-image-container',
            start: 'top 75%',
          },
          scale: 0.95,
          opacity: 0,
          duration: 1.2,
          ease: 'power2.out',
        });
      }, container);

      return () => {
        ctx.revert();
      };
    },
    { scope: container },
  );

  return (
    <section ref={container} className="py-24 md:py-32 bg-wellness-gray-100">
      <div className="container mx-auto px-6 md:px-12">
        <div className="approach-header mb-16">
          <h2 className="approach-title text-4xl md:text-5xl font-heading font-bold text-wellness-navy tracking-tight max-w-2xl">
            Our Approach to Better Health
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="approach-image-container relative h-[500px] lg:h-[700px] w-full rounded-[2rem] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=1000"
              alt="Scientific research in laboratory"
              fill
              className="approach-image object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="approach-grid grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {approaches.map((item, index) => (
              <div key={index} className="approach-item">
                <div className="text-5xl font-heading font-light text-wellness-green/30 mb-4">
                  {item.number}
                </div>
                <h3 className="text-2xl font-heading font-bold text-wellness-navy mb-3">
                  {item.title}
                </h3>
                <p className="text-wellness-charcoal/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
