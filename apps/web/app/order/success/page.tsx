'use client';

import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    type: string;
  };
  quantity: number;
}

interface OrderData {
  orderId: string;
  paymentId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingForm: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  date: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  hasRxItems?: boolean;
  rxFileName?: string | null;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve the order details from localStorage
    const savedOrder = localStorage.getItem('last_order');
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Failed to parse saved order details:', e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-wellness-white text-wellness-charcoal flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-wellness-green/30 border-t-wellness-green rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-wellness-white text-wellness-charcoal flex items-center justify-center px-4 pt-12 pb-24">
        <div className="max-w-md w-full bg-white border border-wellness-gray-200 p-8 rounded-3xl text-center space-y-6 shadow-xl glass-premium">
          <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Clock size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-extrabold tracking-tight text-wellness-navy">
              No Active Order Found
            </h2>
            <p className="text-sm text-wellness-charcoal/60 leading-relaxed">
              We couldn't retrieve any order details for this session. It might have already expired
              or been cleared.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-wellness-green hover:bg-wellness-navy text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm w-full justify-center"
          >
            <span>Browse Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // Generate tracking estimate: 3 days from checkout date
  const orderDate = new Date(order.date);
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

  // Shipment stages
  const orderStatus = order.status || 'pending';
  const timelineStages = [
    {
      id: 1,
      title: 'Order Placed & Verified',
      desc: 'Payment successfully processed and verified via Razorpay.',
      icon: CheckCircle2,
      status: 'completed',
      time: orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 2,
      title:
        orderStatus === 'cancelled'
          ? 'Prescription Review Rejected'
          : orderStatus === 'confirmed'
            ? 'Prescription Verified'
            : 'Pharmacist Prescription Review',
      desc:
        orderStatus === 'cancelled'
          ? 'Prescription or details rejected by clinical administrators. Order Cancelled.'
          : orderStatus === 'confirmed'
            ? 'Our registered medical experts verified the prescription compatibility.'
            : 'Our registered medical experts are verifying prescription & drug compatibility.',
      icon: ShieldCheck,
      status:
        orderStatus === 'confirmed'
          ? 'completed'
          : orderStatus === 'cancelled'
            ? 'failed'
            : 'current',
      time:
        orderStatus === 'confirmed'
          ? 'Approved'
          : orderStatus === 'cancelled'
            ? 'Rejected'
            : 'In Progress',
    },
    {
      id: 3,
      title: 'Dispensing & Sterile Packaging',
      desc:
        orderStatus === 'cancelled'
          ? 'Packaging halted due to cancellation.'
          : 'Medicines prepared in sterile conditions and securely vacuum-sealed.',
      icon: Package,
      status: orderStatus === 'confirmed' ? 'completed' : 'upcoming',
      time: orderStatus === 'confirmed' ? 'Completed' : 'Pending',
    },
    {
      id: 4,
      title: 'Dispatched for Premium Delivery',
      desc:
        orderStatus === 'cancelled'
          ? 'Delivery cancelled.'
          : 'Handed over to Wellness Express for cold-chain climate shipment.',
      icon: Truck,
      status: orderStatus === 'confirmed' ? 'current' : 'upcoming',
      time: orderStatus === 'confirmed' ? 'In Transit' : 'Pending',
    },
  ];

  return (
    <div className="min-h-screen bg-wellness-white text-wellness-charcoal pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Animated Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white/80 border border-wellness-gray-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 overflow-hidden shadow-xl glass-premium"
        >
          {/* Decorative glass glow blobs */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-wellness-green/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-wellness-light-green/40 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 bg-wellness-green/10 border border-wellness-green/20 text-wellness-green rounded-full flex items-center justify-center mx-auto shadow-inner relative">
            <CheckCircle2 size={32} className="stroke-[2.5]" />
            <span className="absolute inset-0 rounded-full border border-wellness-green/20 animate-ping opacity-35"></span>
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-wellness-green tracking-widest bg-wellness-green/10 px-3.5 py-1 rounded-full">
              <Sparkles size={10} />
              <span>Transaction Secured</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight mt-3 text-wellness-navy">
              Your Order is Confirmed!
            </h1>
            <p className="text-sm text-wellness-charcoal/70 max-w-lg mx-auto">
              Thank you for choosing The Wellness. Your payment was validated successfully, and our
              pharmacy team is already compiling your care package.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-wellness-gray-200 text-left text-xs">
            <div>
              <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                Order ID
              </p>
              <p className="font-mono font-bold text-wellness-navy mt-1 text-sm select-all">
                {order.orderId}
              </p>
            </div>
            <div>
              <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                Payment ID
              </p>
              <p className="font-mono font-bold text-wellness-navy mt-1 text-sm select-all">
                {order.paymentId.substring(0, 16)}...
              </p>
            </div>
            <div>
              <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                Checkout Date
              </p>
              <p className="font-semibold text-wellness-navy mt-1">{formattedOrderDate}</p>
            </div>
            <div>
              <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                Method
              </p>
              <p className="font-semibold text-wellness-navy mt-1">Razorpay Secure Gateway</p>
            </div>
          </div>
        </motion.div>

        {/* Outer Grid for Tracking vs order details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shipment stages timeline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/80 border border-wellness-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg glass-premium">
              <div className="flex items-center justify-between border-b border-wellness-gray-200 pb-4">
                <h3 className="text-lg font-heading font-extrabold text-wellness-navy flex items-center gap-2">
                  <Truck className="text-wellness-green" size={20} />
                  <span>Real-time Tracking</span>
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${
                    orderStatus === 'confirmed'
                      ? 'text-wellness-green bg-wellness-green/10'
                      : orderStatus === 'cancelled'
                        ? 'text-red-500 bg-red-50'
                        : 'text-amber-600 bg-amber-50'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      orderStatus === 'confirmed'
                        ? 'bg-wellness-green'
                        : orderStatus === 'cancelled'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                    }`}
                  ></span>
                  <span>{orderStatus}</span>
                </span>
              </div>

              {/* Estimate Delivery Display */}
              <div className="flex items-center gap-4 bg-wellness-gray-100 border border-wellness-gray-200/50 p-4 rounded-2xl">
                <Calendar className="text-wellness-green shrink-0" size={24} />
                <div>
                  <p className="text-[10px] text-wellness-charcoal/50 font-bold uppercase tracking-widest">
                    Estimated Delivery
                  </p>
                  <p className="text-sm font-extrabold text-wellness-navy mt-0.5">
                    {formattedEstimateDate}
                  </p>
                </div>
              </div>

              {/* Timeline Graphic */}
              <div className="relative pl-6 space-y-8 mt-4">
                {/* Vertical timeline connector track */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-wellness-gray-200"></div>

                {timelineStages.map((stage) => {
                  const Icon = stage.icon;
                  return (
                    <div key={stage.id} className="relative flex gap-4 items-start">
                      {/* Stage Node Point */}
                      <div
                        className={`absolute -left-6 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                          stage.status === 'completed'
                            ? 'bg-wellness-green border-wellness-green text-white shadow-md shadow-wellness-green/20'
                            : stage.status === 'current'
                              ? 'bg-white border-wellness-green text-wellness-green animate-pulse shadow-sm'
                              : stage.status === 'failed'
                                ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20'
                                : 'bg-wellness-gray-100 border-wellness-gray-200 text-wellness-charcoal/30'
                        }`}
                      >
                        <Icon
                          size={14}
                          className={
                            stage.status === 'completed' || stage.status === 'failed'
                              ? 'stroke-[2.5]'
                              : ''
                          }
                        />
                      </div>

                      <div className="flex-grow pl-6">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              stage.status === 'completed'
                                ? 'text-wellness-navy'
                                : stage.status === 'current'
                                  ? 'text-wellness-green font-extrabold'
                                  : stage.status === 'failed'
                                    ? 'text-red-500 font-extrabold'
                                    : 'text-wellness-charcoal/40'
                            }`}
                          >
                            {stage.title}
                          </h4>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              stage.status === 'completed'
                                ? 'bg-wellness-green/10 text-wellness-green'
                                : stage.status === 'current'
                                  ? 'bg-blue-500/10 text-blue-600'
                                  : stage.status === 'failed'
                                    ? 'bg-red-500/10 text-red-600'
                                    : 'bg-wellness-gray-100 text-wellness-charcoal/40'
                            }`}
                          >
                            {stage.time}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            stage.status === 'upcoming'
                              ? 'text-wellness-charcoal/40'
                              : 'text-wellness-charcoal/70'
                          }`}
                        >
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order items and billing */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery address */}
            <div className="bg-white/80 border border-wellness-gray-200 rounded-3xl p-6 space-y-4 shadow-lg glass-premium">
              <h3 className="text-sm font-heading font-extrabold text-wellness-navy flex items-center gap-2 border-b border-wellness-gray-200 pb-3">
                <MapPin className="text-wellness-green" size={16} />
                <span>Delivery Address</span>
              </h3>
              <div className="text-xs text-wellness-charcoal space-y-1">
                <p className="font-bold text-sm text-wellness-navy">
                  {order.shippingForm.fullName}
                </p>
                <p className="font-medium text-wellness-charcoal/60">{order.shippingForm.phone}</p>
                <p className="font-medium text-wellness-charcoal/60">{order.shippingForm.email}</p>
                <p className="pt-2 font-medium leading-relaxed font-sans text-wellness-charcoal/80">
                  {order.shippingForm.address},<br />
                  {order.shippingForm.city} - {order.shippingForm.zipCode}
                </p>
              </div>
            </div>

            {/* Itemized cost card */}
            <div className="bg-white/80 border border-wellness-gray-200 rounded-3xl p-6 space-y-4 shadow-lg glass-premium">
              <h3 className="text-sm font-heading font-extrabold text-wellness-navy flex items-center gap-2 border-b border-wellness-gray-200 pb-3">
                <ShoppingBag className="text-wellness-green" size={16} />
                <span>Ordered Items</span>
              </h3>

              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 items-center text-xs">
                    <div className="relative w-10 h-10 bg-wellness-gray-100 rounded-lg border border-wellness-gray-200 overflow-hidden shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-wellness-navy truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-wellness-charcoal/50 font-bold mt-0.5 uppercase tracking-wide">
                        Qty: {item.quantity} • {item.product.type}
                      </p>
                    </div>
                    <span className="font-bold text-wellness-navy shrink-0">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotals breakdown */}
              <div className="border-t border-wellness-gray-200 pt-4 space-y-2 text-xs font-semibold text-wellness-charcoal/60">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-wellness-navy">₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {order.shipping === 0 ? (
                    <span className="text-wellness-green uppercase tracking-wider font-bold">
                      Free
                    </span>
                  ) : (
                    <span className="text-wellness-navy">₹{order.shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (10%)</span>
                  <span className="text-wellness-navy">₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-wellness-gray-200 pt-3 flex justify-between text-sm font-heading font-extrabold text-wellness-navy">
                  <span>Total Cost</span>
                  <span className="text-wellness-green">₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action button routing back to shop */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-wellness-green hover:bg-wellness-navy text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm w-full sm:w-auto cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-widest font-bold text-wellness-charcoal/40 hover:text-wellness-green transition-colors cursor-pointer"
          >
            Go back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
