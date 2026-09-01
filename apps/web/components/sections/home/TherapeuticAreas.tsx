'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowRight, Heart, Wind, Brain, Baby, Activity, Pill } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const therapies = [
  {
    id: 1,
    name: 'Cardiovascular',
    icon: <Heart size={28} />,
    image:
      'https://images.unsplash.com/photo-1507559114002-3f1406087796?auto=format&fit=crop&q=80&w=600',
    desc: 'Comprehensive care for heart health and hypertension management.',
  },
  {
    id: 2,
    name: 'Respiratory',
    icon: <Wind size={28} />,
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    desc: 'Advanced inhalers and therapies for asthma and COPD.',
  },
  {
    id: 3,
    name: 'Neurology',
    icon: <Brain size={28} />,
    image:
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600',
    desc: 'Innovative treatments for cognitive and neurological disorders.',
  },
  {
    id: 4,
    name: 'Pediatrics',
    icon: <Baby size={28} />,
    image:
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=600',
    desc: 'Safe, specialized formulations designed for children.',
  },
  {
    id: 5,
    name: 'Anti-Infectives',
    icon: <Activity size={28} />,
    image:
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600',
    desc: 'Broad-spectrum antibiotics and antiviral treatments.',
  },
  {
    id: 6,
    name: 'OTC & Wellness',
    icon: <Pill size={28} />,
    image:
      'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600',
    desc: 'Trusted daily supplements and over-the-counter remedies.',
  },
];

export default function TherapeuticAreas() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        gsap.from('.therapy-header', {
          scrollTrigger: { trigger: '.therapy-header', start: 'top 85%' },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });

        gsap.from('.therapy-card', {
          scrollTrigger: { trigger: '.therapy-grid', start: 'top 80%' },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
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
    <section ref={container} className="py-24 md:py-32 bg-wellness-gray-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="therapy-header flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-wellness-green uppercase tracking-wider mb-3">
              Our Focus Areas
            </h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold text-wellness-navy mb-4 tracking-tight">
              Leading Therapies for Global Needs
            </h3>
            <p className="text-lg text-wellness-charcoal/70 font-medium">
              We leverage cutting-edge science to address the world's most pressing health
              challenges across multiple therapeutic categories.
            </p>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-2 text-wellness-navy font-semibold hover:text-wellness-green transition-colors pb-2 border-b-2 border-wellness-navy hover:border-wellness-green"
          >
            Explore all therapeutic areas
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="therapy-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapies.map((therapy) => (
            <Link
              key={therapy.id}
              href={`/products?category=${encodeURIComponent(therapy.name)}`}
              className="therapy-card group relative block aspect-[4/3] rounded-2xl overflow-hidden"
            >
              <Image
                src={therapy.image}
                alt={therapy.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wellness-navy/90 via-wellness-navy/40 to-black/10 transition-opacity duration-300"></div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mb-4 group-hover:bg-wellness-green transition-colors duration-300">
                  {therapy.icon}
                </div>
                <h4 className="text-2xl font-heading font-bold text-white mb-2 group-hover:text-wellness-light-green transition-colors">
                  {therapy.name}
                </h4>
                <div className="overflow-hidden">
                  <p className="text-white/80 font-medium line-clamp-2 transform lg:translate-y-8 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                    {therapy.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
