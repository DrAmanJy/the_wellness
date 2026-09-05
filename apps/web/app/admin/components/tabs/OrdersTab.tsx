'use client';

import {
  ShoppingBag,
  RefreshCw,
  ShieldAlert,
  Check,
  Download,
  X,
  Package,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

import { OrderData } from '../../types';

import { generateInvoicePDF } from '@/lib/invoiceGenerator';

interface OrdersTabProps {
  orders: OrderData[];
  isRefreshingOrders: boolean;
  onRefreshOrders: () => Promise<void>;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderData['status']) => Promise<void>;
}

export default function OrdersTab({
  orders,
  isRefreshingOrders,
  onRefreshOrders,
  onUpdateOrderStatus,
}: OrdersTabProps) {
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
  >('all');

  const statusOptions = [
    'all',
    'pending',
    'confirmed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ] as const;

  const labelMap: Record<string, string> = {
    all: 'All Orders',
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Dispatched',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const filteredOrders = orders.filter((ord) => {
    if (orderStatusFilter === 'all') return true;
    return ord.status === orderStatusFilter;
  });

  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-heading font-bold text-wellness-navy flex items-center gap-2">
            <ShoppingBag size={18} className="text-wellness-green" />
            Secure Transaction Orders
          </h3>
          <p className="text-xs text-wellness-charcoal/60 mt-0.5 font-medium">
            Review prescription approvals, customer details, and update dispatch statuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              void onRefreshOrders();
            }}
            disabled={isRefreshingOrders}
            className="bg-white border border-wellness-gray-200 text-wellness-navy text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-wellness-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshingOrders ? 'animate-spin' : ''} />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 border-b border-wellness-gray-150 pb-4">
        {statusOptions.map((status) => {
          const isActive = orderStatusFilter === status;
          const count =
            status === 'all' ? orders.length : orders.filter((o) => o.status === status).length;

          return (
            <button
              key={status}
              onClick={() => {
                setOrderStatusFilter(status);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isActive
                  ? 'bg-wellness-navy text-white border-wellness-navy'
                  : 'bg-white text-wellness-charcoal/60 border-wellness-gray-200 hover:text-wellness-navy hover:bg-wellness-gray-50'
              }`}
            >
              <span>{labelMap[status] || status}</span> ({count})
            </button>
          );
        })}
      </div>

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 text-center text-wellness-charcoal/50 bg-white rounded-3xl border border-wellness-gray-200 shadow-sm flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-wellness-gray-50 flex items-center justify-center mb-4 text-wellness-charcoal/30">
            <ShoppingBag size={24} />
          </div>
          <h4 className="text-base font-bold text-wellness-navy">No orders found</h4>
          <p className="text-xs text-wellness-charcoal/60 mt-1 max-w-xs leading-relaxed font-semibold">
            {orderStatusFilter === 'all'
              ? 'No customer orders have been recorded in the database yet.'
              : `No orders found with status "${labelMap[orderStatusFilter]}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((ord) => {
            const status = ord.status;
            const isPending = status === 'pending';
            const isConfirmed = status === 'confirmed';
            const isCancelled = status === 'cancelled';
            const ordDate = new Date(ord.date);
            const displayDate = ordDate.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={ord.orderId}
                className={`bg-white border rounded-3xl shadow-sm transition-all relative overflow-hidden flex flex-col hover:shadow-md ${
                  isConfirmed
                    ? 'border-wellness-green/30'
                    : isCancelled
                      ? 'border-red-200'
                      : 'border-wellness-gray-200'
                }`}
              >
                {/* Side status strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isConfirmed ? 'bg-wellness-green' : isCancelled ? 'bg-red-500' : 'bg-amber-400'
                  }`}
                />

                {/* Order Header */}
                <div className="p-6 pb-4 border-b border-wellness-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ml-1.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-wellness-navy">
                        {ord.orderId}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border ${
                          isConfirmed
                            ? 'bg-wellness-green/10 text-wellness-green border-wellness-green/20'
                            : isCancelled
                              ? 'bg-red-50 text-red-500 border-red-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-[10px] text-wellness-charcoal/40 font-semibold font-mono">
                      Date Placed: {displayDate}
                    </p>
                  </div>

                  <div className="text-sm font-extrabold text-wellness-navy font-heading">
                    Total Cost: <span className="text-wellness-green">₹{ord.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 ml-1.5 text-xs text-wellness-charcoal/80">
                  {/* Customer & Prescription Info */}
                  <div className="lg:col-span-4 space-y-4">
                    <div>
                      <h5 className="font-extrabold text-wellness-navy uppercase tracking-wider text-[9px] mb-2 font-heading">
                        Delivery Details
                      </h5>
                      <div className="space-y-1 bg-wellness-gray-50/60 p-3 rounded-2xl border border-wellness-gray-150">
                        <p className="font-extrabold text-wellness-navy">
                          {ord.shippingForm.fullName}
                        </p>
                        <p className="font-semibold text-wellness-charcoal/60">
                          {ord.shippingForm.phone}
                        </p>
                        <p className="font-semibold text-wellness-charcoal/60 truncate">
                          {ord.shippingForm.email}
                        </p>
                        <p className="pt-1.5 font-medium leading-relaxed">
                          {ord.shippingForm.address},<br />
                          {ord.shippingForm.city} - {ord.shippingForm.zipCode}
                        </p>
                      </div>
                    </div>

                    {/* Prescription Details */}
                    <div>
                      <h5 className="font-extrabold text-wellness-navy uppercase tracking-wider text-[9px] mb-2 font-heading">
                        Clinical Authorization
                      </h5>
                      {ord.hasRxItems ? (
                        <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-2xl flex items-start gap-2">
                          <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="font-bold text-amber-800 text-[10px] uppercase tracking-wider">
                              Prescription (Rx) Required
                            </p>
                            <p className="font-semibold text-amber-700 mt-1 select-all font-mono text-[9px] break-all">
                              📄 {ord.rxFileName || 'medical_prescription_certified.pdf'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-wellness-green/[0.03] border border-wellness-green/10 p-3 rounded-2xl flex items-start gap-2">
                          <Check className="text-wellness-green shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="font-bold text-wellness-green text-[10px] uppercase tracking-wider">
                              OTC Only (No Rx Required)
                            </p>
                            <p className="font-medium text-wellness-charcoal/50 text-[10px] mt-0.5">
                              All items in this care package are Over-The-Counter compatible.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ordered Items List */}
                  <div className="lg:col-span-8 space-y-4">
                    <h5 className="font-extrabold text-wellness-navy uppercase tracking-wider text-[9px] mb-1 font-heading">
                      Care Package Items
                    </h5>
                    <div className="border border-wellness-gray-150 rounded-2xl overflow-hidden divide-y divide-wellness-gray-100 bg-white">
                      {ord.items.map((item) => (
                        <div
                          key={item.product.id}
                          className="p-3 flex items-center justify-between gap-4 text-xs font-semibold"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-wellness-gray-50 border border-wellness-gray-200 rounded-lg overflow-hidden shrink-0 relative">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div>
                              <h6 className="font-bold text-wellness-navy">{item.product.name}</h6>
                              <p className="text-[10px] text-wellness-charcoal/40 font-mono mt-0.5">
                                {item.product.type} • Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-wellness-navy">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-[9px] text-wellness-charcoal/40">
                              ₹{item.product.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Calculations */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 justify-end text-[10px] text-wellness-charcoal/50 font-bold uppercase tracking-wider pt-2 border-t border-wellness-gray-100">
                      <div>
                        Subtotal:{' '}
                        <span className="text-wellness-navy">₹{ord.subtotal.toFixed(2)}</span>
                      </div>
                      <div>
                        Shipping:{' '}
                        <span className="text-wellness-navy">
                          {ord.shipping === 0 ? 'Free' : `₹${ord.shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div>
                        GST Tax (10%):{' '}
                        <span className="text-wellness-navy">₹{ord.tax.toFixed(2)}</span>
                      </div>
                      <div className="text-xs font-extrabold text-wellness-green">
                        Grand Total: ₹{ord.total.toFixed(2)}
                      </div>
                    </div>

                    {/* Administrative Actions */}
                    <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-wellness-gray-100">
                      <div className="flex items-center gap-3 mr-auto">
                        <span className="text-[10px] text-wellness-charcoal/40 font-mono">
                          Payment ID: {ord.paymentId}
                        </span>
                        {(ord.status === 'confirmed' || ord.status === 'delivered') && (
                          <button
                            onClick={() => {
                              generateInvoicePDF(ord);
                            }}
                            className="px-2.5 py-1 border border-wellness-gray-200 hover:bg-wellness-gray-50 text-wellness-navy rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <Download size={12} />
                            <span>Invoice PDF</span>
                          </button>
                        )}
                      </div>

                      {isPending ? (
                        <>
                          <button
                            onClick={() => {
                              void onUpdateOrderStatus(ord.orderId, 'cancelled');
                            }}
                            className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <X size={14} />
                            Reject & Cancel
                          </button>
                          <button
                            onClick={() => {
                              void onUpdateOrderStatus(ord.orderId, 'confirmed');
                            }}
                            className="px-4 py-2 bg-wellness-green hover:bg-wellness-navy text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <Check size={14} />
                            Accept & Confirm
                          </button>
                        </>
                      ) : isConfirmed ? (
                        <>
                          <span className="text-xs text-wellness-green font-bold flex items-center gap-1.5 mr-2">
                            <Check size={16} className="stroke-[2.5]" />
                            Confirmed
                          </span>
                          <button
                            onClick={() => {
                              void onUpdateOrderStatus(ord.orderId, 'shipped');
                            }}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            Mark Dispatched
                          </button>
                          <button
                            onClick={() => {
                              void onUpdateOrderStatus(ord.orderId, 'cancelled');
                            }}
                            className="px-3.5 py-1.5 border border-wellness-gray-200 hover:bg-red-50 text-red-500 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        </>
                      ) : status === 'shipped' || status === 'processing' ? (
                        <>
                          <span className="text-xs text-blue-600 font-bold flex items-center gap-1.5 mr-2">
                            <Package size={16} />
                            Dispatched
                          </span>
                          <button
                            onClick={() => {
                              void onUpdateOrderStatus(ord.orderId, 'out_for_delivery');
                            }}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            Mark Out for Delivery
                          </button>
                          <button
                            onClick={() => {
                              void onUpdateOrderStatus(ord.orderId, 'cancelled');
                            }}
                            className="px-3.5 py-1.5 border border-wellness-gray-200 hover:bg-red-50 text-red-500 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        </>
                      ) : status === 'out_for_delivery' ? (
                        <>
                          <span className="text-xs text-amber-600 font-bold flex items-center gap-1.5 mr-2">
                            <Truck size={16} />
                            Out for Delivery
                          </span>
                          <button
                            onClick={() => {
                              void onUpdateOrderStatus(ord.orderId, 'delivered');
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            Mark as Delivered
                          </button>
                          <button
                            onClick={() => {
                              void onUpdateOrderStatus(ord.orderId, 'cancelled');
                            }}
                            className="px-3.5 py-1.5 border border-wellness-gray-200 hover:bg-red-50 text-red-500 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        </>
                      ) : status === 'delivered' ? (
                        <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          Order Delivered
                        </span>
                      ) : (
                        <>
                          <span className="text-xs text-red-500 font-bold flex items-center gap-1.5 mr-2">
                            <X size={16} className="stroke-[2.5]" />
                            Order Cancelled
                          </span>
                          <button
                            onClick={() => {
                              void onUpdateOrderStatus(ord.orderId, 'confirmed');
                            }}
                            className="px-3.5 py-1.5 border border-wellness-gray-200 hover:bg-wellness-gray-50 text-wellness-navy rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Re-Confirm Order
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
