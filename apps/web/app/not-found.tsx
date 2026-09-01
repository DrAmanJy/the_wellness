'use client';

import { ArrowLeft, Home, Activity, ShoppingBag, MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center relative overflow-hidden bg-wellness-white px-6 pt-12 pb-20">
      {/* Glowing background orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-wellness-light-green/30 glow-orb -z-10"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-wellness-green/10 glow-orb -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-xl w-full text-center bg-white/50 border border-wellness-gray-200/80 rounded-3xl p-8 md:p-12 shadow-xl glass-premium z-10 relative overflow-hidden"
      >
        {/* Subtle top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-wellness-green"></div>

        {/* Pulse Heart Indicator */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-20 h-20 bg-wellness-green/10 border border-wellness-green/20 text-wellness-green rounded-full flex items-center justify-center mx-auto shadow-inner mb-6 animate-in fade-in zoom-in duration-550"
        >
          <Activity size={36} className="stroke-[1.8] animate-pulse" />
        </motion.div>

        {/* 404 Status */}
        <h1 className="text-8xl font-heading font-black text-wellness-navy tracking-tighter leading-none mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-heading font-extrabold text-wellness-navy mb-3">
          Clinical Route Unavailable
        </h2>

        {/* Description */}
        <p className="text-sm text-wellness-charcoal/60 leading-relaxed font-semibold max-w-sm mx-auto mb-10">
          The formulation, therapy description, or portal directory you requested does not exist or
          has been relocated within our scientific catalog.
        </p>

        {/* Navigation Quick Links Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Link
            href="/"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-wellness-gray-200 hover:border-wellness-green hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-wellness-navy/5 text-wellness-navy group-hover:bg-wellness-green group-hover:text-white flex items-center justify-center transition-colors">
              <Home size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-wellness-navy">Main Portal</p>
              <p className="text-[10px] text-wellness-charcoal/50 font-semibold mt-0.5">
                Return Home
              </p>
            </div>
          </Link>

          <Link
            href="/products"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-wellness-gray-200 hover:border-wellness-green hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-wellness-navy/5 text-wellness-navy group-hover:bg-wellness-green group-hover:text-white flex items-center justify-center transition-colors">
              <ShoppingBag size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-wellness-navy">Catalog</p>
              <p className="text-[10px] text-wellness-charcoal/50 font-semibold mt-0.5">
                Therapies List
              </p>
            </div>
          </Link>

          <Link
            href="/contact"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-wellness-gray-200 hover:border-wellness-green hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-wellness-navy/5 text-wellness-navy group-hover:bg-wellness-green group-hover:text-white flex items-center justify-center transition-colors">
              <MessageSquare size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-wellness-navy">Contact Clinic</p>
              <p className="text-[10px] text-wellness-charcoal/50 font-semibold mt-0.5">
                Support Desk
              </p>
            </div>
          </Link>

          <Link
            href="/account"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-wellness-gray-200 hover:border-wellness-green hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-wellness-navy/5 text-wellness-navy group-hover:bg-wellness-green group-hover:text-white flex items-center justify-center transition-colors">
              <Sparkles size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-wellness-navy">My Account</p>
              <p className="text-[10px] text-wellness-charcoal/50 font-semibold mt-0.5">
                Order Status
              </p>
            </div>
          </Link>
        </div>

        {/* Back Action button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-wellness-navy hover:bg-wellness-green text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </motion.div>
    </div>
  );
}
