'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ShieldCheck, CheckCircle, Microscope, FlaskConical } from 'lucide-react';
import Image from 'next/image';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function QualityPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        gsap.from('.quality-hero', {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });

        gsap.from('.quality-card', {
          scrollTrigger: {
            trigger: '.quality-grid',
            start: 'top 80%',
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
        });

        const progressBars = gsap.utils.toArray<HTMLElement>('.progress-fill');
        progressBars.forEach((bar) => {
          const targetWidth = bar.getAttribute('data-width');
          if (!targetWidth) return;
          gsap.to(bar, {
            scrollTrigger: {
              trigger: bar,
              start: 'top 85%',
            },
            width: targetWidth,
            duration: 1.5,
            ease: 'power3.out',
          });
        });

        // New animations
        gsap.from('.cert-card', {
          scrollTrigger: {
            trigger: '.cert-section',
            start: 'top 80%',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
        });

        gsap.from('.process-step', {
          scrollTrigger: {
            trigger: '.process-section',
            start: 'top 75%',
          },
          x: -40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
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
    <div ref={container} className="bg-wellness-white min-h-screen pt-12">
      <div className="container mx-auto px-6 md:px-12 mb-24">
        <div className="quality-hero max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto bg-wellness-green/10 rounded-full flex items-center justify-center mb-8">
            <ShieldCheck className="text-wellness-green" size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-wellness-navy mb-6 tracking-tight">
            Every product is held to a higher standard.
          </h1>
          <p className="text-xl text-wellness-charcoal/70 leading-relaxed max-w-2xl mx-auto">
            Quality is not an afterthought; it is the foundation of our entire process. We exceed
            industry standards to ensure safety, purity, and efficacy.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 mb-24">
        <div className="quality-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <CheckCircle size={24} />,
              title: 'cGMP Certified',
              desc: 'Manufactured in FDA-registered, cGMP-certified facilities.',
            },
            {
              icon: <Microscope size={24} />,
              title: 'Purity Testing',
              desc: 'Raw materials tested for heavy metals, microbes, and allergens.',
            },
            {
              icon: <FlaskConical size={24} />,
              title: 'Potency Validation',
              desc: 'Post-production analysis ensures label claims match active ingredients.',
            },
            {
              icon: <ShieldCheck size={24} />,
              title: 'Traceability',
              desc: 'End-to-end tracking from source ingredient to final bottled product.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="quality-card bg-white p-8 rounded-2xl shadow-sm border border-wellness-gray-100 text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full bg-wellness-navy text-white flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-heading font-bold text-wellness-navy mb-3">
                {item.title}
              </h3>
              <p className="text-wellness-charcoal/70 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-wellness-navy text-white py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold mb-8">Our Quality Metrics</h2>
              <p className="text-white/70 mb-12 leading-relaxed">
                We measure our success not just by sales, but by the consistent, unyielding quality
                of every batch we produce. Our rejection rate for sub-standard raw materials is
                higher than the industry average, because your health demands it.
              </p>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>Raw Material Acceptance Rate</span>
                    <span className="text-wellness-green">42%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="progress-fill h-full bg-wellness-green w-0"
                      data-width="42%"
                    ></div>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    We reject 58% of sourced materials that fail our strict purity standards.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>Third-Party Testing Compliance</span>
                    <span className="text-wellness-green">100%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="progress-fill h-full bg-wellness-green w-0"
                      data-width="100%"
                    ></div>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    Every single batch is independently verified.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative h-[500px] rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800"
                alt="Quality Control Laboratory"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="process-section py-24 bg-wellness-gray-50 border-y border-wellness-gray-200">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-wellness-green font-bold tracking-wider uppercase text-sm mb-4 block">
              The Wellness Standard
            </span>
            <h2 className="text-4xl font-heading font-bold text-wellness-navy mb-4">
              5-Step Assurance Process
            </h2>
            <p className="text-lg text-wellness-charcoal/70">
              From seed to shelf, our rigorous protocol guarantees uncompromising excellence.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                num: '01',
                title: 'Global Sourcing Verification',
                desc: 'We audit every supplier on-site. Raw materials are quarantined upon arrival until they pass our initial identity and purity tests.',
              },
              {
                num: '02',
                title: 'Contaminant Screening',
                desc: 'Utilizing High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry to detect traces of heavy metals, pesticides, and microbial growth.',
              },
              {
                num: '03',
                title: 'Precision Blending',
                desc: 'Ingredients are mixed in climate-controlled, positive-pressure cleanrooms to prevent cross-contamination and ensure uniform distribution.',
              },
              {
                num: '04',
                title: 'In-Process Quality Checks',
                desc: 'Every 30 minutes during production, samples are pulled from the line to verify weight, disintegration rates, and visual consistency.',
              },
              {
                num: '05',
                title: 'Final Lot Release',
                desc: 'A dedicated QA team reviews all batch records and third-party lab results before a single bottle is approved for distribution.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="process-step flex items-start gap-6 bg-white p-8 rounded-2xl shadow-sm border border-wellness-gray-100"
              >
                <div className="text-3xl font-heading font-black text-wellness-green/20 mt-1">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold text-wellness-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-wellness-charcoal/70 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cert-section py-24 bg-wellness-white">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl font-heading font-bold text-wellness-navy mb-12">
            Global Certifications
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { name: 'ISO 9001', label: 'Quality Management' },
              { name: 'FDA', label: 'Registered Facility' },
              { name: 'NSF', label: 'GMP Certified' },
              { name: 'WHO', label: 'GMP Compliant' },
            ].map((cert, idx) => (
              <div key={idx} className="cert-card flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-wellness-gray-50 border-2 border-wellness-gray-200 flex items-center justify-center text-wellness-navy font-black text-xl mb-4">
                  {cert.name}
                </div>
                <span className="text-wellness-charcoal font-semibold text-sm uppercase tracking-wider">
                  {cert.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
