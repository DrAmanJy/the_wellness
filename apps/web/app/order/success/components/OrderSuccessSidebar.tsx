'use client';

import { ChevronRight, HelpCircle, MapPin, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

import type { OrderData } from '../../types';

interface OrderSuccessSidebarProps {
  order: OrderData;
}

export default function OrderSuccessSidebar({ order }: OrderSuccessSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Delivery Address Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white border border-wellness-gray-200 rounded-[28px] p-6 space-y-4 shadow-md"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <MapPin size={16} />
          </div>
          <h2 className="text-sm font-heading font-extrabold text-wellness-navy">
            Shipping Destination
          </h2>
        </div>
        <div className="text-xs space-y-1.5 text-slate-700 font-medium">
          <p className="font-extrabold text-sm text-wellness-navy">{order.shippingForm.fullName}</p>
          <p className="text-slate-500 font-mono text-[11px]">{order.shippingForm.phone}</p>
          <p className="text-slate-500 font-mono text-[11px]">{order.shippingForm.email}</p>
          <div className="pt-2 border-t border-slate-100 text-slate-600 leading-relaxed font-sans">
            {order.shippingForm.address},<br />
            {order.shippingForm.city} - {order.shippingForm.zipCode}
          </div>
        </div>
      </motion.div>

      {/* Payment & Billing Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-white border border-wellness-gray-200 rounded-[28px] p-6 space-y-4 shadow-md"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-wellness-navy/5 text-wellness-navy flex items-center justify-center">
            <ShoppingBag size={16} />
          </div>
          <h2 className="text-sm font-heading font-extrabold text-wellness-navy">
            Billing Summary
          </h2>
        </div>

        <div className="space-y-2.5 text-xs font-semibold text-slate-600">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="text-wellness-navy font-bold">₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping & Cold-Chain</span>
            {order.shipping === 0 ? (
              <span className="text-emerald-600 font-extrabold uppercase text-[10px] tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                Free Express
              </span>
            ) : (
              <span className="text-wellness-navy font-bold">₹{order.shipping.toFixed(2)}</span>
            )}
          </div>
          <div className="flex justify-between">
            <span>GST Tax (10%)</span>
            <span className="text-wellness-navy font-bold">₹{order.tax.toFixed(2)}</span>
          </div>

          <div className="border-t border-slate-100 pt-3.5 flex justify-between items-baseline text-wellness-navy">
            <span className="font-heading font-black text-sm">Total Paid</span>
            <span className="text-xl font-heading font-black text-emerald-600">
              ₹{order.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium mt-2">
          <span>Payment Method</span>
          <span className="font-bold text-wellness-navy">Razorpay Secure</span>
        </div>
      </motion.div>

      {/* Need Help / Customer Support Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-emerald-950 text-white rounded-[28px] p-6 space-y-3 shadow-md relative overflow-hidden"
      >
        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-widest">
          <HelpCircle size={14} />
          <span>Clinical Support</span>
        </div>
        <h3 className="text-base font-heading font-extrabold text-white">
          Have questions about your order?
        </h3>
        <p className="text-xs text-emerald-200/80 leading-relaxed font-medium">
          Our registered clinical staff are on standby 24/7 to assist with prescription questions or
          shipment updates.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-between w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
        >
          <span>Contact Pharmacy Team</span>
          <ChevronRight size={14} />
        </Link>
      </motion.div>
    </div>
  );
}
