'use client';

import { MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import type { OrderData } from '../../types';

interface OrderDeliveryCardProps {
  shippingForm: OrderData['shippingForm'];
}

export default function OrderDeliveryCard({ shippingForm }: OrderDeliveryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bg-white border border-wellness-gray-200 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-md"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 font-bold">
          <MapPin size={18} />
        </div>
        <h3 className="text-base font-heading font-extrabold text-wellness-navy">
          Delivery Details
        </h3>
      </div>

      <div className="space-y-4 text-xs">
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            Recipient Information
          </span>
          <p className="font-extrabold text-wellness-navy text-sm">{shippingForm.fullName}</p>
          {(shippingForm.phone || shippingForm.email) && (
            <div className="space-y-1 text-wellness-charcoal/70 font-semibold pt-1">
              {shippingForm.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={13} className="text-wellness-green shrink-0" />
                  <span>{shippingForm.phone}</span>
                </p>
              )}
              {shippingForm.email && (
                <p className="flex items-center gap-2">
                  <Mail size={13} className="text-wellness-green shrink-0" />
                  <span className="truncate">{shippingForm.email}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            Shipping Address
          </span>
          <p className="font-semibold text-wellness-navy leading-relaxed">
            {shippingForm.address}
            {shippingForm.city || shippingForm.zipCode ? (
              <>
                ,<br />
                {[shippingForm.city, shippingForm.zipCode].filter(Boolean).join(' - ')}
              </>
            ) : null}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
