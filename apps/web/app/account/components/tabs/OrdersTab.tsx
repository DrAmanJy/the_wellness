'use client';

import {
  ShoppingBag,
  ArrowRight,
  Package,
  ChevronDown,
  ChevronUp,
  Download,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import type { OrderData } from '../../types';

import { generateInvoicePDF } from '@/lib/invoiceGenerator';

interface OrdersTabProps {
  orders: OrderData[];
}

export default function OrdersTab({ orders }: OrdersTabProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <motion.div
      key="orders-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {orders.length === 0 ? (
        <div className="bg-white/80 border border-wellness-gray-200 p-12 rounded-3xl text-center space-y-6 shadow-lg glass-premium">
          <div className="w-16 h-16 bg-wellness-gray-100 text-wellness-charcoal/30 rounded-full flex items-center justify-center mx-auto border border-wellness-gray-200">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="text-xl font-heading font-extrabold text-wellness-navy">
              No Orders Placed Yet
            </h3>
            <p className="text-sm text-wellness-charcoal/60 leading-relaxed">
              Your active orders and delivery status updates will display here once you checkout.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-wellness-green hover:bg-wellness-navy text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md text-sm cursor-pointer"
          >
            <span>Shop Scientific Healthcare</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isExpanded = expandedOrderId === ord.orderId;
            const dateObj = new Date(ord.date);
            const displayDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={ord.orderId}
                className="bg-white/80 border border-wellness-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all glass-premium"
              >
                {/* Summary row */}
                <div
                  onClick={() => {
                    toggleOrderExpand(ord.orderId);
                  }}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-white/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-wellness-green/10 text-wellness-green rounded-xl flex items-center justify-center border border-wellness-green/20">
                      <Package size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-wellness-navy font-mono">
                        {ord.orderId}
                      </h4>
                      <p className="text-xs text-wellness-charcoal/40 mt-0.5">
                        Placed on {displayDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-wellness-charcoal/40">Total Amount</p>
                      <p className="text-sm font-extrabold text-wellness-navy font-heading mt-0.5">
                        ₹{ord.total.toFixed(2)}
                      </p>
                    </div>

                    <div className="hidden sm:flex flex-col items-end">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${
                          ord.status === 'confirmed'
                            ? 'text-wellness-green bg-wellness-green/10 border-wellness-green/20'
                            : ord.status === 'cancelled'
                              ? 'text-red-500 bg-red-50 border-red-100'
                              : 'text-amber-600 bg-amber-50 border-amber-100'
                        }`}
                      >
                        {ord.status || 'pending'}
                      </span>
                      <p className="text-[9px] text-wellness-charcoal/40 font-mono mt-0.5">
                        {ord.status === 'confirmed'
                          ? 'Approved & Shipping'
                          : ord.status === 'cancelled'
                            ? 'Cancelled'
                            : 'Pending Approval'}
                      </p>
                    </div>

                    {isExpanded ? (
                      <ChevronUp size={16} className="text-wellness-charcoal/40" />
                    ) : (
                      <ChevronDown size={16} className="text-wellness-charcoal/40" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-wellness-gray-200 bg-wellness-gray-50/50"
                    >
                      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs text-wellness-charcoal/80">
                        {/* Left: ordered items list */}
                        <div className="md:col-span-7 space-y-4">
                          <h5 className="font-bold text-wellness-navy uppercase tracking-wider text-[10px] border-b border-wellness-gray-200 pb-1.5">
                            Ordered Items
                          </h5>
                          <div className="space-y-3">
                            {ord.items.map((item) => (
                              <div key={item.product.id} className="flex gap-3 items-center">
                                <div className="relative w-10 h-10 bg-white rounded border border-wellness-gray-200 overflow-hidden shrink-0">
                                  <Image
                                    src={item.product.image}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h6 className="font-bold text-wellness-navy truncate">
                                    {item.product.name}
                                  </h6>
                                  <p className="text-[10px] text-wellness-charcoal/40 mt-0.5 uppercase tracking-wide">
                                    Qty: {item.quantity} • {item.product.type}
                                  </p>
                                </div>
                                <span className="font-bold text-wellness-navy shrink-0">
                                  ₹{(item.product.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            {ord.status === 'delivered' ? (
                              <button
                                onClick={() => {
                                  generateInvoicePDF(ord);
                                }}
                                className="inline-flex items-center gap-1.5 bg-wellness-navy hover:bg-wellness-green text-white px-3.5 py-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-xs active:scale-95"
                              >
                                <Download size={13} className="shrink-0 text-emerald-400" />
                                <span>Download Tax Invoice</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border-amber-200/80 px-2.5 py-1.5 rounded-xl font-semibold border">
                                <Clock size={12} className="shrink-0 text-amber-600" />
                                <span>Invoice available after delivery</span>
                              </span>
                            )}
                            <Link
                              href={`/order/status?id=${ord.orderId}`}
                              className="inline-flex items-center gap-1.5 text-wellness-green hover:text-wellness-navy transition-colors font-bold font-heading text-[11px] uppercase tracking-wider"
                            >
                              <span>Tracking Timeline</span>
                              <ArrowRight size={12} />
                            </Link>
                          </div>
                        </div>

                        {/* Right: Delivery recipient details & costs */}
                        <div className="md:col-span-5 space-y-5">
                          <div className="space-y-2">
                            <h5 className="font-bold text-wellness-navy uppercase tracking-wider text-[10px] border-b border-wellness-gray-200 pb-1.5">
                              Delivery Address
                            </h5>
                            <p className="font-bold text-wellness-navy">
                              {ord.shippingForm.fullName}
                            </p>
                            <p>{ord.shippingForm.address}</p>
                            <p>
                              {ord.shippingForm.city} - {ord.shippingForm.zipCode}
                            </p>
                            <p className="text-wellness-charcoal/50">
                              {ord.shippingForm.phone} | {ord.shippingForm.email}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-wellness-gray-200">
                            <div className="flex justify-between text-wellness-charcoal/60">
                              <span>Subtotal</span>
                              <span>₹{ord.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-wellness-charcoal/60">
                              <span>Shipping</span>
                              <span>
                                {ord.shipping === 0 ? 'Free' : `₹${ord.shipping.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="flex justify-between text-wellness-charcoal/60">
                              <span>GST Tax (10%)</span>
                              <span>₹{ord.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-wellness-navy pt-1.5 border-t border-dashed border-wellness-gray-200 text-sm">
                              <span>Total Cost</span>
                              <span className="text-wellness-green">₹{ord.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
