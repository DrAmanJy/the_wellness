'use client';

import { Lock, Package } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { CartItem } from '@/context/CartContext';

interface OrderSummaryProps {
  cartItems: CartItem[];
  cartSubtotal: number;
  shippingCost: number;
  taxCost: number;
  totalCost: number;
}

export default function OrderSummary({
  cartItems,
  cartSubtotal,
  shippingCost,
  taxCost,
  totalCost,
}: OrderSummaryProps) {
  return (
    <div className="bg-wellness-gray-50 border border-wellness-gray-200 rounded-2xl p-6 md:p-8 space-y-6 sticky top-40">
      <h3 className="text-lg font-heading font-bold text-wellness-navy border-b border-wellness-gray-200 pb-3 flex items-center gap-2">
        <Package size={20} />
        <span>Order Summary</span>
      </h3>

      {/* Items list */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex gap-4 items-center">
            <div className="relative w-12 h-12 bg-white rounded border border-wellness-gray-200 overflow-hidden shrink-0">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="text-xs font-bold text-wellness-navy truncate">{item.product.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold text-wellness-navy bg-wellness-gray-200/60 px-1.5 py-0.2 rounded uppercase tracking-wider">
                  {item.product.type}
                </span>
                <span className="text-[10px] text-wellness-charcoal/50 font-medium">
                  Qty: {item.quantity}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-wellness-navy shrink-0">
              ₹{(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Costs breakdown */}
      <div className="border-t border-wellness-gray-200 pt-4 space-y-2 text-xs font-medium text-wellness-charcoal/70">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-wellness-navy font-bold">₹{cartSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          {shippingCost === 0 ? (
            <span className="text-wellness-green font-bold uppercase tracking-wider">Free</span>
          ) : (
            <span className="text-wellness-navy font-bold">₹{shippingCost.toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between">
          <span>Tax (10%)</span>
          <span className="text-wellness-navy font-bold">₹{taxCost.toFixed(2)}</span>
        </div>
        <div className="border-t border-wellness-gray-200 pt-3 flex justify-between text-sm font-heading font-bold text-wellness-navy">
          <span>Total Amount</span>
          <span>₹{totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-2.5 justify-center pt-2 text-[10px] text-wellness-charcoal/40 font-bold uppercase tracking-wider border-t border-wellness-gray-200/50">
        <Lock size={12} />
        <span>256-bit SSL Encryption</span>
      </div>
    </div>
  );
}
