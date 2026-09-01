'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Image from 'next/image';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const processes = [
  {
    phase: 'Phase 01',
    title: 'Discover',
    desc: 'Identifying crucial health gaps through epidemiological data and clinical feedback to define clear therapeutic targets.',
  },
  {
    phase: 'Phase 02',
    title: 'Research',
    desc: 'Extensive literature reviews and initial formulation modeling to select the most bioavailable active compounds.',
  },
  {
    phase: 'Phase 03',
    title: 'Develop',
    desc: 'Iterative prototyping in our advanced labs, focusing on optimal delivery mechanisms and compound stability.',
  },
  {
    phase: 'Phase 04',
    title: 'Validate',
    desc: 'Rigorous third-party testing and internal clinical trials to ensure efficacy, purity, and safety profiles.',
  },
  {
    phase: 'Phase 05',
    title: 'Deliver',
    desc: 'Manufacturing under strict cGMP guidelines to deliver premium, consistent healthcare solutions to our patients.',
  },
];

export default function ResearchPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        gsap.from('.research-hero', {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });

        // Pin the image while scrolling through process
        ScrollTrigger.create({
          trigger: '.process-section',
          start: 'top top',
          end: 'bottom bottom',
          pin: '.process-image-container',
          pinSpacing: false,
        });

        gsap.utils.toArray('.process-step').forEach((step: any, i) => {
          gsap.from(step, {
            scrollTrigger: {
              trigger: step,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: true,
            },
            opacity: 0.2,
            x: -20,
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
    <div ref={container} className="bg-wellness-navy text-white min-h-screen pt-12">
      <div className="container mx-auto px-6 md:px-12 mb-24">
        <div className="research-hero max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 tracking-tight text-wellness-light-green">
            Research-Driven Healthcare
          </h1>
          <p className="text-xl text-wellness-light-green/70 leading-relaxed">
            We don't follow trends. We follow the science. Our innovation process is designed to
            yield measurable, clinical outcomes.
          </p>
        </div>
      </div>

      <div className="process-section relative container mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-12 pb-24">
        {/* Left Side - Process Steps */}
        <div className="w-full md:w-1/2 py-12 md:py-32 flex flex-col gap-32">
          {processes.map((proc, index) => (
            <div key={index} className="process-step min-h-[30vh] flex flex-col justify-center">
              <span className="text-wellness-green font-mono text-sm mb-4 tracking-widest uppercase">
                {proc.phase}
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">{proc.title}</h2>
              <p className="text-lg text-white/70 leading-relaxed max-w-md">{proc.desc}</p>
            </div>
          ))}
        </div>

        {/* Right Side - Pinned Image */}
        <div className="hidden md:block w-1/2 relative">
          <div className="process-image-container sticky top-32 h-[70vh] rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 bg-wellness-green/20 mix-blend-overlay z-10"></div>
            <Image
              src="https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=800"
              alt="Scientific research visualization"
              fill
              className="object-cover grayscale"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Global R&D Facilities Section */}
      <section className="py-24 bg-wellness-white text-wellness-navy mt-12 rounded-t-[3rem]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 tracking-tight">
              Global R&D Centers
            </h2>
            <p className="text-lg text-wellness-charcoal/70">
              Our state-of-the-art facilities span the globe, enabling 24/7 collaborative research
              and specialized therapeutic development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-wellness-gray-50 rounded-2xl overflow-hidden shadow-sm border border-wellness-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-64 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
                  alt="Boston R&D Center"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-heading font-bold mb-3">Boston, USA</h3>
                <p className="text-wellness-green font-medium mb-4">Biologics & Oncology Hub</p>
                <p className="text-wellness-charcoal/70">
                  Focuses on advanced monoclonal antibodies and targeted cancer therapies,
                  leveraging proximity to leading academic institutions.
                </p>
              </div>
            </div>
            <div className="bg-wellness-gray-50 rounded-2xl overflow-hidden shadow-sm border border-wellness-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-64 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"
                  alt="Basel R&D Center"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-heading font-bold mb-3">Basel, Switzerland</h3>
                <p className="text-wellness-green font-medium mb-4">Small Molecule Innovation</p>
                <p className="text-wellness-charcoal/70">
                  Our European flagship facility dedicated to pioneering new chemical entities for
                  cardiovascular and metabolic disorders.
                </p>
              </div>
            </div>
            <div className="bg-wellness-gray-50 rounded-2xl overflow-hidden shadow-sm border border-wellness-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-64 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800"
                  alt="Singapore R&D Center"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-heading font-bold mb-3">Singapore</h3>
                <p className="text-wellness-green font-medium mb-4">
                  Tropical Medicine & Formulations
                </p>
                <p className="text-wellness-charcoal/70">
                  Specializes in novel delivery systems for extreme climates and emerging infectious
                  disease treatments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
