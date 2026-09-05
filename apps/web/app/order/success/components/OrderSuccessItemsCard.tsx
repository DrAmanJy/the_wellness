'use client';

import { ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import React from 'react';

import type { OrderData } from '../../types';

interface OrderSuccessItemsCardProps {
  order: OrderData;
}

export default function OrderSuccessItemsCard({ order }: OrderSuccessItemsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white border border-wellness-gray-200 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-md"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-wellness-navy/5 text-wellness-navy rounded-xl flex items-center justify-center font-bold">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h2 className="text-base font-heading font-extrabold text-wellness-navy">
              Ordered Products ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
            <p className="text-[11px] text-wellness-charcoal/50 font-medium">
              Items included in your care package
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {order.items.map((item) => (
          <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
            <div className="relative w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shrink-0 shadow-xs">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-wellness-navy text-sm truncate">{item.product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                  Qty: {item.quantity}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                  {item.product.type}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-extrabold text-wellness-navy text-sm">
                ₹{(item.product.price * item.quantity).toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                ₹{item.product.price.toFixed(2)} each
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
