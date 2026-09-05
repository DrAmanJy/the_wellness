'use client';

import { ArrowLeft, Check, Copy, Download, XCircle, Clock, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

import type { OrderData } from '../../types';

interface OrderStatusHeaderProps {
  order: OrderData;
  copiedId: boolean;
  onCopyOrderId: () => void;
  onPrintInvoice: () => void;
}

export default function OrderStatusHeader({
  order,
  copiedId,
  onCopyOrderId,
  onPrintInvoice,
}: OrderStatusHeaderProps) {
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  const formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const estimatedDelivery = new Date(
    new Date(order.date).getTime() + 2 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      {/* Navigation Breadcrumb Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-bold text-wellness-charcoal/70 hover:text-wellness-navy transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Account Dashboard</span>
        </Link>
        <span className="text-xs font-mono font-extrabold text-slate-400">
          Ref: {order.orderId}
        </span>
      </div>

      {/* HEADER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-wellness-gray-200 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-wellness-green via-emerald-400 to-wellness-navy" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-heading font-extrabold text-wellness-navy">
                Order Tracking & Status
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 ${
                  isDelivered
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isCancelled
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {order.status || 'Confirmed'}
              </span>
            </div>
            <p className="text-xs text-wellness-charcoal/60 font-medium">
              Order Placed on <span className="font-bold text-wellness-navy">{formattedDate}</span>
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onCopyOrderId}
              className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-wellness-navy px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {copiedId ? (
                <Check size={14} className="text-emerald-600 shrink-0" />
              ) : (
                <Copy size={14} className="shrink-0" />
              )}
              <span>{copiedId ? 'Copied ID!' : 'Copy Order ID'}</span>
            </button>

            {isDelivered ? (
              <button
                onClick={onPrintInvoice}
                className="inline-flex items-center gap-2 bg-wellness-navy hover:bg-wellness-green text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <Download size={14} className="text-emerald-400 shrink-0" />
                <span>Download Tax Invoice</span>
              </button>
            ) : isCancelled ? (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                <XCircle size={14} className="text-red-600 shrink-0" />
                <span>Order Cancelled</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                <Clock size={14} className="text-amber-600 shrink-0" />
                <span>Invoice available after delivery</span>
              </span>
            )}
          </div>
        </div>

        {/* METADATA GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Payment Txn ID
            </span>
            <p className="font-mono font-extrabold text-wellness-navy mt-1 text-xs truncate">
              {order.paymentId}
            </p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Est. Arrival Date
            </span>
            <p
              className={`font-extrabold mt-1 text-xs ${
                isCancelled ? 'text-red-600 line-through' : 'text-emerald-700'
              }`}
            >
              {isCancelled ? 'Cancelled' : estimatedDelivery}
            </p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Delivery Partner
            </span>
            <p className="font-extrabold text-wellness-navy mt-1 text-xs flex items-center gap-1">
              <Truck size={13} className="text-wellness-green shrink-0" />
              <span>Wellness Express Log.</span>
            </p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Total Order Amount
            </span>
            <p className="font-extrabold text-wellness-navy mt-1 text-xs">
              ₹{order.total.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
