'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Globe, Users, HeartPulse, Award } from 'lucide-react';
import Image from 'next/image';
import React, { useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        // Hero animations
        gsap.from('.about-hero-title', {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });

        gsap.from('.about-hero-image', {
          scale: 1.05,
          opacity: 0,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.2,
        });

        // Timeline Line
        gsap.from('.timeline-line', {
          scrollTrigger: {
            trigger: '.timeline-container',
            start: 'top 70%',
            end: 'bottom 80%',
            scrub: 1.5,
          },
          scaleY: 0,
          transformOrigin: 'top center',
          ease: 'none',
        });

        // Timeline Items
        gsap.utils.toArray('.timeline-item').forEach((item) => {
          const el = item as HTMLElement;
          const dot = el.querySelector('.timeline-dot');
          const content = el.querySelector('.timeline-content');

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
          });

          if (dot && content) {
            tl.from(dot, {
              scale: 0,
              opacity: 0,
              duration: 0.6,
              ease: 'back.out(2)',
            }).from(
              content,
              {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
              },
              '-=0.4',
            );
          }
        });

        // Leadership animation
        gsap.from('.leader-card', {
          scrollTrigger: {
            trigger: '.leadership-section',
            start: 'top 75%',
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
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
    <div ref={container} className="bg-wellness-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-12 pb-24 px-6 md:px-12 container mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-sm font-bold text-wellness-green uppercase tracking-widest mb-4 block">
            Who We Are
          </span>
          <h1 className="about-hero-title text-5xl md:text-7xl font-heading font-bold text-wellness-navy tracking-tight mb-8">
            Caring for Life.
          </h1>
          <p className="text-xl text-wellness-charcoal/70 leading-relaxed max-w-3xl mx-auto">
            We are a leading global pharmaceutical corporation driven by a singular purpose: making
            high-quality healthcare accessible and affordable to all.
          </p>
        </div>

        <div className="about-hero-image relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl mb-24">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000"
            alt="The Wellness Global Headquarters"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            priority
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 max-w-5xl mx-auto pb-12 border-b border-wellness-gray-200">
          <div>
            <h2 className="text-3xl font-heading font-bold text-wellness-navy mb-6">Our Mission</h2>
            <p className="text-lg text-wellness-charcoal/80 leading-relaxed font-medium">
              To democratize access to premium, science-backed healthcare. We believe that optimal
              health should not be a luxury, but a standard accessible through rigorous research,
              vast manufacturing scale, and uncompromising quality.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-heading font-bold text-wellness-navy mb-6">Our Vision</h2>
            <p className="text-lg text-wellness-charcoal/80 leading-relaxed font-medium">
              A future where preventative healthcare and targeted wellness solutions empower
              individuals to live their fullest lives, supported by transparent, clinical-grade
              supplementation and life-saving pharmaceuticals.
            </p>
          </div>
        </div>
      </section>

      {/* Corporate Values Section */}
      <section className="py-24 bg-wellness-gray-50 border-y border-wellness-gray-200">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold text-wellness-green uppercase tracking-widest mb-4 block">
              Core Values
            </span>
            <h2 className="text-4xl font-heading font-bold text-wellness-navy mb-6">
              What Drives Us Forward
            </h2>
            <p className="text-lg text-wellness-charcoal/70">
              Our foundational principles dictate every decision, from laboratory research to global
              distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-wellness-gray-100">
              <div className="w-16 h-16 rounded-xl bg-wellness-green/10 text-wellness-green flex items-center justify-center mb-6">
                <HeartPulse size={32} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-wellness-navy mb-4">
                Patient-Centricity
              </h3>
              <p className="text-wellness-charcoal/70 leading-relaxed">
                We place the patient at the center of everything we do. Our formulations are
                designed for maximum compliance, minimal side effects, and superior clinical
                outcomes.
              </p>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-wellness-gray-100">
              <div className="w-16 h-16 rounded-xl bg-wellness-green/10 text-wellness-green flex items-center justify-center mb-6">
                <Award size={32} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-wellness-navy mb-4">
                Integrity & Quality
              </h3>
              <p className="text-wellness-charcoal/70 leading-relaxed">
                We never compromise on the safety or efficacy of our products. Stringent quality
                controls and ethical business practices guide our global operations.
              </p>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-wellness-gray-100">
              <div className="w-16 h-16 rounded-xl bg-wellness-green/10 text-wellness-green flex items-center justify-center mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-wellness-navy mb-4">
                Accessible Innovation
              </h3>
              <p className="text-wellness-charcoal/70 leading-relaxed">
                Innovation is meaningless if patients cannot access it. We focus on scaling
                breakthrough therapies to make them affordable to communities worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Impact Section */}
      <section className="py-24 bg-wellness-navy text-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-heading font-bold mb-6">Our Global Footprint</h2>
            <p className="text-wellness-white/70 text-lg">
              Operating across continents to ensure uninterrupted supply of critical products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Globe size={32} />,
                title: '50+',
                desc: 'Countries with active operations and distribution.',
              },
              {
                icon: <Users size={32} />,
                title: '25,000+',
                desc: 'Dedicated employees globally.',
              },
              {
                icon: <HeartPulse size={32} />,
                title: '500M+',
                desc: 'Patients reached annually with our therapies.',
              },
              {
                icon: <Award size={32} />,
                title: '20+',
                desc: 'World-class manufacturing facilities.',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-8 bg-white/5 rounded-2xl border border-white/10"
              >
                <div className="text-wellness-green flex justify-center mb-6">{stat.icon}</div>
                <h3 className="text-4xl font-heading font-bold mb-2">{stat.title}</h3>
                <p className="text-white/60 font-medium">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="leadership-section py-24 bg-wellness-white">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl font-heading font-bold text-wellness-navy text-center mb-16">
            Board of Directors & Leadership
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Dr. Sarah Chen',
                role: 'Chief Executive Officer',
                image:
                  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
              },
              {
                name: 'Michael Reynolds',
                role: 'Chief Financial Officer',
                image:
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
              },
              {
                name: 'Dr. Arthur Vance',
                role: 'Chief Medical Officer',
                image:
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
              },
              {
                name: 'Elena Rostova',
                role: 'Global Head of Manufacturing',
                image:
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
              },
            ].map((leader, i) => (
              <div key={i} className="leader-card group">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-6 bg-wellness-gray-100">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-xl font-heading font-bold text-wellness-navy mb-1">
                  {leader.name}
                </h3>
                <p className="text-wellness-green font-semibold text-sm uppercase tracking-wider">
                  {leader.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 container mx-auto px-6 md:px-12 overflow-hidden border-t border-wellness-gray-200">
        <h2 className="text-4xl font-heading font-bold text-wellness-navy text-center mb-16">
          Our Journey
        </h2>

        <div className="timeline-container max-w-4xl mx-auto relative">
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-wellness-gray-200 md:-translate-x-1/2"></div>
          <div className="timeline-line absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-wellness-green md:-translate-x-1/2 origin-top"></div>

          {[
            {
              year: '1998',
              title: 'The Foundation',
              desc: 'Founded by a team of clinical researchers determined to bridge the gap between expensive pharmaceutical science and daily patient needs.',
            },
            {
              year: '2005',
              title: 'First Major Factory',
              desc: 'Opened our first massive-scale FDA-compliant manufacturing facility to pioneer novel delivery mechanisms at scale.',
            },
            {
              year: '2012',
              title: 'Global Expansion',
              desc: 'Expanded our operations to reach over 20 international markets, bringing premium healthcare worldwide.',
            },
            {
              year: '2023',
              title: 'Sustainability Pledge',
              desc: 'Committed to 100% sustainable packaging and carbon-neutral manufacturing processes across all global sites.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`timeline-item relative flex flex-col md:flex-row gap-8 md:gap-0 mb-16 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="hidden md:block md:w-1/2"></div>

              <div className="timeline-dot absolute left-0 md:left-1/2 w-14 h-14 rounded-full bg-wellness-green border-4 border-white flex items-center justify-center -translate-x-1/2 z-10 shadow-sm">
                <span className="text-white text-sm font-bold">{item.year}</span>
              </div>

              <div
                className={`timeline-content md:w-1/2 pl-20 md:pl-0 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}
              >
                <h3 className="text-2xl font-heading font-bold text-wellness-navy mb-3 mt-2">
                  {item.title}
                </h3>
                <p className="text-wellness-charcoal/70 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
