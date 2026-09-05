'use client';

import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  ShieldCheck,
  XCircle,
  Calendar,
  History,
  Navigation,
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import type { OrderData, OrderStatusHistoryItem } from '../../types';

interface OrderStatusTimelineProps {
  order: OrderData;
}

const STEPS = [
  {
    key: 'pending',
    title: 'Pending',
    description: 'Order placed & awaiting admin confirmation',
    icon: Clock,
  },
  {
    key: 'confirmed',
    title: 'Confirmed',
    description: 'Order verified & confirmed by admin',
    icon: ShieldCheck,
  },
  {
    key: 'dispatched',
    title: 'Dispatched',
    description: 'Handed over to express courier partner',
    icon: Package,
  },
  {
    key: 'out_for_delivery',
    title: 'Out for Delivery',
    description: 'Delivery executive is en route to your address',
    icon: Truck,
  },
  {
    key: 'delivered',
    title: 'Delivered',
    description: 'Package successfully delivered & confirmed',
    icon: Home,
  },
];

function getStepTimestamp(
  stepKey: string,
  history?: OrderStatusHistoryItem[],
  orderDate?: string,
): string | null {
  if (history && history.length > 0) {
    const matchingEntry = history.find((h) => {
      const s = h.status.toLowerCase();
      if (stepKey === 'dispatched') {
        return s === 'dispatched' || s === 'shipped' || s === 'processing';
      }
      return s === stepKey.toLowerCase();
    });

    if (matchingEntry && matchingEntry.createdAt) {
      return new Date(matchingEntry.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  }

  if (stepKey === 'pending' && orderDate) {
    return new Date(orderDate).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return null;
}

function getStepProgress(status?: string): number {
  switch (status) {
    case 'pending':
      return 1;
    case 'confirmed':
      return 2;
    case 'processing':
    case 'shipped':
    case 'dispatched':
      return 3;
    case 'out_for_delivery':
      return 4;
    case 'delivered':
      return 5;
    case 'cancelled':
      return 6;
    default:
      return 1;
  }
}

export default function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  const displayedSteps = isCancelled
    ? [
        ...STEPS,
        {
          key: 'cancelled',
          title: 'Cancelled',
          description: 'Order was cancelled during processing',
          icon: XCircle,
        },
      ]
    : STEPS;

  const currentStepIndex = getStepProgress(order.status);

  const estimatedDelivery = new Date(
    new Date(order.date).getTime() + 2 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white border border-wellness-gray-200 rounded-[28px] p-6 sm:p-8 space-y-8 shadow-md"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold shrink-0 ${
              isCancelled
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}
          >
            <Navigation size={20} className="shrink-0" />
          </div>
          <div>
            <h2 className="text-base font-heading font-extrabold text-wellness-navy">
              Fulfillment Timeline
            </h2>
            <p className="text-xs text-wellness-charcoal/60 font-medium">
              Live step-by-step progress tracking for package #{order.orderId}
            </p>
          </div>
        </div>
        {isDelivered && (
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={13} /> Completed
          </span>
        )}
        {isCancelled && (
          <span className="bg-red-50 border border-red-200 text-red-700 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
            <XCircle size={13} /> Cancelled
          </span>
        )}
      </div>

      {/* STEPPER GRAPHIC */}
      <div className="relative py-4">
        {/* Connecting Background Line */}
        <div
          className="hidden md:block absolute top-10 h-1 bg-slate-100 rounded-full"
          style={{
            left: `${String(50 / displayedSteps.length)}%`,
            right: `${String(50 / displayedSteps.length)}%`,
          }}
        />

        {/* Animated Filled Progress Line */}
        <motion.div
          className={`hidden md:block absolute top-10 h-1 rounded-full ${
            isCancelled
              ? 'bg-gradient-to-r from-wellness-green via-amber-400 to-red-500'
              : 'bg-gradient-to-r from-wellness-green to-emerald-400'
          }`}
          style={{
            left: `${String(50 / displayedSteps.length)}%`,
          }}
          initial={{ width: '0%' }}
          animate={{
            width: `${String(
              currentStepIndex > 1
                ? Math.min(
                    ((displayedSteps.length - 1) / displayedSteps.length) * 100,
                    ((currentStepIndex - 1) / displayedSteps.length) * 100,
                  )
                : 0,
            )}%`,
          }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />

        {/* Steps Grid */}
        <div
          className={`grid grid-cols-1 ${
            displayedSteps.length === 6 ? 'md:grid-cols-6' : 'md:grid-cols-5'
          } gap-6 relative z-10`}
        >
          {displayedSteps.map((step, idx) => {
            const stepNum = idx + 1;
            const isPassed = stepNum < currentStepIndex;
            const isCurrent = currentStepIndex === stepNum;
            const isStepCancelled = step.key === 'cancelled';
            const StepIcon = step.icon;
            const stepTimestamp = getStepTimestamp(step.key, order.statusHistory, order.date);

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-3"
              >
                {/* Step Icon Badge */}
                <div className="relative shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all shadow-sm ${
                      isStepCancelled && isCurrent
                        ? 'bg-red-500 text-white ring-4 ring-red-500/20 scale-110'
                        : isStepCancelled
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : isCurrent
                            ? 'bg-wellness-navy text-emerald-400 ring-4 ring-wellness-navy/15 scale-110'
                            : isPassed
                              ? 'bg-wellness-green text-white'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <StepIcon size={20} />
                  </motion.div>
                  {isCurrent && !isDelivered && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isStepCancelled ? 'bg-red-400' : 'bg-emerald-400'
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                          isStepCancelled ? 'bg-red-500' : 'bg-wellness-green'
                        }`}
                      />
                    </span>
                  )}
                </div>

                {/* Step Content */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 md:justify-center">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider ${
                        isStepCancelled && (isCurrent || isPassed)
                          ? 'text-red-600 font-black'
                          : isCurrent
                            ? 'text-wellness-green font-black'
                            : isPassed
                              ? 'text-wellness-navy'
                              : 'text-slate-400'
                      }`}
                    >
                      Step 0{stepNum}
                    </span>
                    {isPassed && !isStepCancelled && (
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    )}
                    {isStepCancelled && (isCurrent || isPassed) && (
                      <XCircle size={12} className="text-red-500 shrink-0" />
                    )}
                  </div>
                  <h3
                    className={`text-xs font-bold font-heading ${
                      isStepCancelled && (isCurrent || isPassed)
                        ? 'text-red-600'
                        : isCurrent || isPassed
                          ? 'text-wellness-navy'
                          : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-wellness-charcoal/50 leading-tight font-medium max-w-[160px] hidden md:block">
                    {step.description}
                  </p>
                  {stepTimestamp && (isPassed || isCurrent) && (
                    <div className="mt-1 flex items-center md:justify-center gap-1">
                      <Calendar size={10} className="text-emerald-600 shrink-0" />
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-mono">
                        {stepTimestamp}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* LIVE SIMULATED ROUTE CARD */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                isCancelled ? 'bg-red-50 text-red-600' : 'bg-wellness-green/10 text-wellness-green'
              }`}
            >
              <Truck size={16} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-wellness-navy">
                Live Dispatch Simulation
              </h4>
              <p className="text-[11px] text-wellness-charcoal/60 font-medium">
                {isCancelled
                  ? 'Fulfillment process was halted due to order cancellation.'
                  : 'Direct express dispatch from main warehouse facility'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full font-mono border text-emerald-700 bg-emerald-50 border-emerald-200">
            Status: {isCancelled ? 'Cancelled' : isDelivered ? 'Delivered' : 'On Schedule'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Origin Facility
            </span>
            <p className="font-bold text-wellness-navy text-xs">Central Pharma Hub (Delhi)</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Destination Address
            </span>
            <p className="font-bold text-wellness-navy text-xs truncate">
              {order.shippingForm.city} ({order.shippingForm.zipCode})
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Expected Arrival
            </span>
            <p
              className={`font-extrabold text-xs ${
                isCancelled ? 'text-red-600 line-through' : 'text-emerald-700'
              }`}
            >
              {isCancelled ? 'Delivery Cancelled' : estimatedDelivery}
            </p>
          </div>
        </div>
      </div>

      {/* ORDER STATUS HISTORY LOG CARD */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
            <History size={16} className="text-wellness-navy" />
            <h4 className="text-xs font-extrabold text-wellness-navy uppercase tracking-wider">
              Order Status History Log
            </h4>
          </div>
          <div className="space-y-2">
            {order.statusHistory.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      item.status === 'cancelled'
                        ? 'bg-red-500'
                        : item.status === 'delivered'
                          ? 'bg-emerald-500'
                          : 'bg-wellness-green'
                    }`}
                  />
                  <div>
                    <span className="font-extrabold text-wellness-navy uppercase text-[11px] tracking-wide">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    {item.comment && (
                      <p className="text-[11px] text-slate-500 font-medium">{item.comment}</p>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                  {new Date(item.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
