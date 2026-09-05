'use client';

import { Sparkles, Truck, ShieldCheck, Clock, Headphones } from 'lucide-react';
import React from 'react';

export default function ProductCatalogFooter() {
  return (
    <>
      {/* Newsletter Section */}
      <div className="mt-24 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-wellness-navy via-[#0C1B33] to-wellness-navy p-8 md:p-12 border border-white/5">
        <div className="absolute right-0 top-0 w-80 h-80 bg-wellness-green/10 glow-orb opacity-50"></div>
        <div className="absolute left-[-10%] bottom-0 w-64 h-64 bg-wellness-light-green/5 glow-orb opacity-20"></div>

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-wellness-green">
            <Sparkles size={12} />
            Stay Informed
          </div>
          <h3 className="text-2xl md:text-3xl font-heading font-black text-white uppercase tracking-tight">
            Subscribe to Clinical Updates
          </h3>
          <p className="text-xs md:text-sm text-wellness-light-green/77 leading-relaxed font-bold">
            Get notified about clinical research, new therapeutics, and regulatory approvals. Join
            our network of healthcare practitioners and patients.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Successfully subscribed to updates!');
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your professional email address"
              className="flex-grow px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-wellness-green focus:ring-1 focus:ring-wellness-green transition-all font-semibold"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-wellness-green hover:bg-white hover:text-wellness-navy text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-wellness-gray-200 pt-16 pb-8">
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-wellness-navy/5 flex items-center justify-center text-wellness-navy shrink-0 border border-wellness-navy/5">
            <Truck size={20} className="stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-wellness-navy">
              Priority Dispensing
            </h4>
            <p className="text-[11px] text-wellness-charcoal/60 leading-relaxed font-medium">
              Same-day clinical verification and cold-chain shipping.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-wellness-navy/5 flex items-center justify-center text-wellness-navy shrink-0 border border-wellness-navy/5">
            <ShieldCheck size={20} className="stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-wellness-navy">
              Certified GMP Products
            </h4>
            <p className="text-[11px] text-wellness-charcoal/60 leading-relaxed font-medium">
              100% compliant with World Health Organization GMP.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-wellness-navy/5 flex items-center justify-center text-wellness-navy shrink-0 border border-wellness-navy/5">
            <Clock size={20} className="stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-wellness-navy">
              Real-time Expiry Sync
            </h4>
            <p className="text-[11px] text-wellness-charcoal/60 leading-relaxed font-medium">
              Automated notifications for batch shelf-life updates.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-wellness-navy/5 flex items-center justify-center text-wellness-navy shrink-0 border border-wellness-navy/5">
            <Headphones size={20} className="stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-wellness-navy">
              Clinical Support Desk
            </h4>
            <p className="text-[11px] text-wellness-charcoal/60 leading-relaxed font-medium">
              Direct access to certified pharmacists and specialists.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
