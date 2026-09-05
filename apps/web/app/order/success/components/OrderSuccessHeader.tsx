'use client';

import {
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

import type { OrderData } from '../../types';

interface OrderSuccessHeaderProps {
  order: OrderData;
  copiedId: boolean;
  onCopyOrderId: () => void;
  onPrintInvoice: () => void;
}

export default function OrderSuccessHeader({
  order,
  copiedId,
  onCopyOrderId,
  onPrintInvoice,
}: OrderSuccessHeaderProps) {
  const orderStatus = order.status || 'pending';

  const orderDate = new Date(order.date || Date.now());
  const estimateDate = new Date(orderDate);
  estimateDate.setDate(orderDate.getDate() + 3);

  const formattedOrderDate = orderDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEstimateDate = estimateDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative bg-white border border-wellness-gray-200 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_60px_rgba(10,25,47,0.06)] overflow-hidden"
    >
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-5">
        {/* Animated Success Badge */}
        <div className="relative">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center border border-emerald-200 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 size={42} className="stroke-[2.2]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-xs">
            <Sparkles size={13} className="text-emerald-500" />
            <span>Payment Verified • Order Received</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-wellness-navy tracking-tight mt-2">
            {orderStatus === 'confirmed'
              ? 'Order Confirmed!'
              : orderStatus === 'cancelled'
                ? 'Order Cancelled'
                : 'Order Placed Successfully!'}
          </h1>
          <p className="text-xs sm:text-sm text-wellness-charcoal/70 font-medium leading-relaxed">
            Thank you,{' '}
            <span className="font-bold text-wellness-navy">{order.shippingForm.fullName}</span>!
            We've received your order and payment. Our clinical administrator team is currently
            reviewing your order for final confirmation and dispatch.
          </p>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onCopyOrderId}
            className="inline-flex items-center gap-2 bg-wellness-gray-50 hover:bg-wellness-gray-100 border border-wellness-gray-200 text-wellness-navy px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {copiedId ? (
              <Check size={14} className="text-emerald-600 shrink-0" />
            ) : (
              <Copy size={14} className="shrink-0" />
            )}
            <span>{copiedId ? 'Copied Order ID!' : `ID: ${order.orderId}`}</span>
          </button>

          {order.status === 'delivered' ? (
            <button
              onClick={onPrintInvoice}
              className="inline-flex items-center gap-2 bg-wellness-navy hover:bg-wellness-green text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Download size={15} className="shrink-0 text-emerald-400" />
              <span>Download Tax Invoice (PDF)</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/90 text-amber-800 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs">
              <Clock size={14} className="shrink-0 text-amber-600" />
              <span>Invoice available after delivery</span>
            </span>
          )}

          <Link
            href={`/order/status?id=${order.orderId}`}
            className="inline-flex items-center gap-2 bg-wellness-green hover:bg-wellness-navy text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Truck size={14} className="shrink-0" />
            <span>Track Live Progress</span>
          </Link>

          <Link
            href="/account"
            className="inline-flex items-center gap-2 bg-wellness-gray-100 hover:bg-wellness-gray-200 text-wellness-navy px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <FileText size={14} className="shrink-0" />
            <span>View Order History</span>
          </Link>
        </div>

        {/* Summary Metadata Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-left text-xs mt-4">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Order Reference
            </span>
            <p className="font-mono font-extrabold text-wellness-navy mt-1 text-xs truncate">
              {order.orderId}
            </p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Payment Reference
            </span>
            <p className="font-mono font-extrabold text-wellness-navy mt-1 text-xs truncate">
              {order.paymentId.slice(0, 16)}...
            </p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Order Date & Time
            </span>
            <p className="font-bold text-wellness-navy mt-1 text-xs">{formattedOrderDate}</p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Est. Express Delivery
            </span>
            <p className="font-extrabold text-emerald-700 mt-1 text-xs">{formattedEstimateDate}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
