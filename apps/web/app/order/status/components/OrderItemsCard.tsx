'use client';

import { Package, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import type { OrderData } from '../../types';

interface OrderItemsCardProps {
  order: OrderData;
}

export default function OrderItemsCard({ order }: OrderItemsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white border border-wellness-gray-200 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-md"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 font-bold">
            <ShoppingBag size={18} />
          </div>
          <h3 className="text-base font-heading font-extrabold text-wellness-navy">
            Care Package Items ({order.items.length})
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">
          {order.items.reduce((acc, i) => acc + i.quantity, 0)} Total Units
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {order.items.map((item, idx) => (
          <div
            key={item.product.id || idx}
            className="py-3.5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center">
                <Package size={20} className="text-slate-300 absolute inset-0 m-auto" />
                <img
                  src={item.product.image || '/images/default-promo-banner.png'}
                  alt=""
                  className="object-cover w-full h-full relative z-10"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-wellness-navy">{item.product.name}</h4>
                <p className="text-[10px] text-wellness-charcoal/50 font-semibold">
                  Qty: {item.quantity} × ₹{item.product.price.toFixed(2)}
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-wellness-navy font-mono">
              ₹{(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex justify-between text-wellness-charcoal/60">
          <span>Items Subtotal</span>
          <span className="font-bold text-wellness-navy">₹{order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-wellness-charcoal/60">
          <span>Shipping Fee</span>
          <span className="font-bold text-wellness-navy">
            {order.shipping === 0 ? 'FREE Express' : `₹${order.shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-wellness-charcoal/60">
          <span>GST Tax (10%)</span>
          <span className="font-bold text-wellness-navy">₹{order.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-extrabold text-wellness-navy pt-2 border-t border-slate-100">
          <span>Grand Total</span>
          <span className="text-emerald-600 font-mono text-base">₹{order.total.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
}
