'use client';

import { CheckCircle2, Clock, Package, Truck, ShieldCheck, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import type { OrderData } from '../../types';

interface OrderSuccessTimelineProps {
  order: OrderData;
}

export default function OrderSuccessTimeline({ order }: OrderSuccessTimelineProps) {
  const orderDate = new Date(order.date || Date.now());
  const estimateDate = new Date(orderDate);
  estimateDate.setDate(orderDate.getDate() + 3);

  const formattedEstimateDate = estimateDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const orderStatus = order.status || 'pending';
  const isCancelled = orderStatus === 'cancelled';
  const isConfirmed = orderStatus === 'confirmed';
  const isDispatched = orderStatus === 'shipped' || orderStatus === 'processing';
  const isOutForDelivery = orderStatus === 'out_for_delivery';
  const isDelivered = orderStatus === 'delivered';

  const timelineStages = [
    {
      id: 1,
      title: 'Pending',
      desc: 'Order placed & awaiting admin confirmation.',
      icon: Clock,
      status: 'completed',
      time: orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 2,
      title: isCancelled ? 'Cancelled' : 'Confirmed',
      desc: isCancelled
        ? 'Order was cancelled during processing.'
        : isConfirmed || isDispatched || isOutForDelivery || isDelivered
          ? 'Order verified and confirmed by admin.'
          : 'Awaiting admin verification & approval.',
      icon: ShieldCheck,
      status: isCancelled
        ? 'failed'
        : isConfirmed || isDispatched || isOutForDelivery || isDelivered
          ? 'completed'
          : 'current',
      time: isCancelled
        ? 'Cancelled'
        : isConfirmed || isDispatched || isOutForDelivery || isDelivered
          ? 'Confirmed'
          : 'Pending',
    },
    {
      id: 3,
      title: 'Dispatched',
      desc: isCancelled ? 'Dispatch cancelled.' : 'Package handed over to express courier partner.',
      icon: Package,
      status: isDispatched || isOutForDelivery || isDelivered ? 'completed' : 'upcoming',
      time: isDispatched || isOutForDelivery || isDelivered ? 'Dispatched' : 'Pending',
    },
    {
      id: 4,
      title: 'Out for Delivery',
      desc: isCancelled ? 'Delivery cancelled.' : 'Delivery executive is en route to your address.',
      icon: Truck,
      status: isOutForDelivery ? 'current' : isDelivered ? 'completed' : 'upcoming',
      time: isOutForDelivery ? 'En Route' : 'Pending',
    },
    {
      id: 5,
      title: 'Delivered',
      desc: isDelivered ? 'Package successfully delivered & confirmed.' : 'Final delivery pending.',
      icon: CheckCircle2,
      status: isDelivered ? 'completed' : 'upcoming',
      time: isDelivered ? 'Delivered' : 'Pending',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white border border-wellness-gray-200 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-md"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 font-bold">
            <Truck size={18} />
          </div>
          <div>
            <h2 className="text-base font-heading font-extrabold text-wellness-navy">
              Fulfillment & Tracking
            </h2>
            <p className="text-[11px] text-wellness-charcoal/50 font-medium">
              Real-time updates on your shipment status
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 border ${
            orderStatus === 'confirmed'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : orderStatus === 'cancelled'
                ? 'text-red-600 bg-red-50 border-red-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              orderStatus === 'confirmed'
                ? 'bg-emerald-500'
                : orderStatus === 'cancelled'
                  ? 'bg-red-500'
                  : 'bg-amber-500'
            }`}
          />
          <span>{orderStatus.toUpperCase()}</span>
        </span>
      </div>

      {/* Estimate Delivery Display Banner */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-900 to-wellness-navy text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
          <Calendar size={24} className="text-emerald-400" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest">
            Guaranteed Delivery Window
          </span>
          <p className="text-base font-extrabold text-white">{formattedEstimateDate}</p>
        </div>
      </div>

      {/* Vertical Timeline Stages */}
      <div className="relative pl-6 space-y-8 mt-6">
        <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-100" />

        {timelineStages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div key={stage.id} className="relative flex gap-4 items-start">
              <div
                className={`absolute -left-6 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                  stage.status === 'completed'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : stage.status === 'current'
                      ? 'bg-white border-emerald-600 text-emerald-600 animate-pulse shadow-sm'
                      : stage.status === 'failed'
                        ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                <Icon
                  size={14}
                  className={
                    stage.status === 'completed' || stage.status === 'failed' ? 'stroke-[2.5]' : ''
                  }
                />
              </div>

              <div className="flex-grow pl-6">
                <div className="flex justify-between items-baseline gap-2">
                  <h3
                    className={`text-xs sm:text-sm font-extrabold ${
                      stage.status === 'completed'
                        ? 'text-wellness-navy'
                        : stage.status === 'current'
                          ? 'text-emerald-700 font-black'
                          : stage.status === 'failed'
                            ? 'text-red-600 font-black'
                            : 'text-slate-400'
                    }`}
                  >
                    {stage.title}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-extrabold ${
                      stage.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : stage.status === 'current'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : stage.status === 'failed'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {stage.time}
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 leading-relaxed font-medium ${
                    stage.status === 'upcoming' ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
