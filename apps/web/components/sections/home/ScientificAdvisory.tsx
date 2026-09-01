'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Stethoscope, Brain, Heart, Award, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const boardMembers = [
  {
    id: 1,
    name: 'Dr. Evelyn Chen, MD, PhD',
    role: 'Chair, Cardiovascular Medicine',
    credentials: 'Johns Hopkins Alumna • Former Assoc. Professor',
    icon: Heart,
    quote:
      'Applying rigorous clinical standards to everyday therapeutics is what sets our formulations apart. We design for measurable efficacy and patient safety.',
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 2,
    name: 'Dr. Marcus Vance, PhD',
    role: 'Director, Neurobiology R&D',
    credentials: 'MIT Brain & Cognitive Sciences Fellow',
    icon: Brain,
    quote:
      'By focusing on cellular bioavailability, we ensure that our cognitive and neural support pathways are both highly active and biochemically stable.',
    image:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3,
    name: 'Dr. Alistair Sterling, MD, FRCP',
    role: 'Clinical Director, Immunology',
    credentials: 'Royal College of Physicians • Pulmonology Lead',
    icon: Stethoscope,
    quote:
      'Addressing respiratory health requires a holistic understanding of environmental triggers and cellular defense. Our targeted delivery systems solve this directly.',
    image:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
  },
];

export default function ScientificAdvisory() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        gsap.from('.advisory-header', {
          scrollTrigger: { trigger: '.advisory-header', start: 'top 85%' },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });

        gsap.from('.advisory-card', {
          scrollTrigger: { trigger: '.advisory-grid', start: 'top 80%' },
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
    <section ref={container} className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-wellness-green/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-wellness-light-green/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="advisory-header text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wellness-green/10 text-wellness-green font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck size={12} className="stroke-[2.5]" />
            <span>Clinical Trust</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-wellness-navy tracking-tight">
            Scientific & Medical Advisory Board
          </h2>
          <p className="text-sm md:text-base text-wellness-charcoal/70 leading-relaxed font-medium">
            Meet the leading medical experts, researchers, and clinicians who guide our therapeutic
            formulations, review clinical data, and validate product efficacy.
          </p>
        </div>

        <div className="advisory-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {boardMembers.map((member) => {
            const Icon = member.icon;
            return (
              <div
                key={member.id}
                className="advisory-card group bg-white border border-wellness-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:shadow-xl hover:border-wellness-green/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="space-y-6">
                  {/* Member headshot & role icon */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-wellness-gray-200 shadow-inner shrink-0">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-heading font-extrabold text-wellness-navy">
                        {member.name}
                      </h3>
                      <p className="text-xs font-bold text-wellness-green/90 uppercase tracking-wide">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Credentials / Affiliations */}
                  <div className="flex items-center gap-2 bg-wellness-gray-50 border border-wellness-gray-100 rounded-xl px-3.5 py-2 text-[11px] font-bold text-wellness-charcoal/60">
                    <Award size={13} className="text-wellness-green shrink-0" />
                    <span>{member.credentials}</span>
                  </div>

                  {/* Quote */}
                  <div className="relative text-xs font-semibold leading-relaxed text-wellness-charcoal/80 italic pl-4 border-l-2 border-wellness-green/35">
                    "{member.quote}"
                  </div>
                </div>

                {/* Bottom detail indicator */}
                <div className="pt-6 mt-6 border-t border-wellness-gray-100 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-wellness-charcoal/40">
                    Board Member
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-wellness-green/10 text-wellness-green flex items-center justify-center group-hover:bg-wellness-green group-hover:text-white transition-all duration-300">
                    <Icon size={14} className="stroke-[2]" />
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
