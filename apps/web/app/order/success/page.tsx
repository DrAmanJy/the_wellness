'use client';

import { ArrowRight, Clock, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

import type { ApiOrder, ApiOrderItem, OrderData } from '../types';
import OrderSuccessActions from './components/OrderSuccessActions';
import OrderSuccessHeader from './components/OrderSuccessHeader';
import OrderSuccessItemsCard from './components/OrderSuccessItemsCard';
import OrderSuccessSidebar from './components/OrderSuccessSidebar';
import OrderSuccessTimeline from './components/OrderSuccessTimeline';

import { generateInvoicePDF } from '@/lib/invoiceGenerator';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    async function loadSuccessOrder() {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      try {
        if (targetId) {
          const res = await fetch(`${backendUrl}/api/orders/${targetId}`, {
            credentials: 'include',
          });
          if (res.ok) {
            const json = (await res.json()) as { success?: boolean; data?: ApiOrder };
            if (json.success && json.data) {
              const ord = json.data;
              setOrder({
                orderId: ord.id,
                paymentId:
                  ord.payment?.transactionId ||
                  ord.payment?.razorpayPaymentId ||
                  ord.payment?.provider ||
                  'PAID',
                items: (ord.items || []).map((i: ApiOrderItem) => ({
                  product: {
                    id: i.productId || 'prod',
                    name: i.productName || 'Therapeutic Formulation',
                    price: i.unitPrice ?? 0,
                    image: '/images/products/product_placeholder.png',
                    type: 'Prescription Medicine',
                  },
                  quantity: i.quantity ?? 1,
                })),
                subtotal: ord.subtotal ?? ord.totalAmount ?? 0,
                shipping: ord.shippingAmount ?? 0,
                tax: ord.taxAmount ?? 0,
                total: ord.totalAmount ?? 0,
                shippingForm: {
                  fullName: ord.shippingAddress?.fullName || 'Customer',
                  email: ord.shippingAddress?.email || '',
                  phone: ord.shippingAddress?.phone || '',
                  address: ord.shippingAddress?.street || '',
                  city: ord.shippingAddress?.city || '',
                  zipCode: ord.shippingAddress?.pincode || '',
                },
                date: ord.createdAt || new Date().toISOString(),
                status: (ord.status as OrderData['status']) ?? 'pending',
              });
              setLoading(false);
              return;
            }
          }
        }

        const resList = await fetch(`${backendUrl}/api/orders`, {
          credentials: 'include',
        });
        if (resList.ok) {
          const jsonList = (await resList.json()) as { success?: boolean; data?: ApiOrder[] };
          if (jsonList.success && Array.isArray(jsonList.data) && jsonList.data.length > 0) {
            const ord = jsonList.data[0];
            setOrder({
              orderId: ord.id,
              paymentId:
                ord.payment?.transactionId ||
                ord.payment?.razorpayPaymentId ||
                ord.payment?.provider ||
                'PAID',
              items: (ord.items || []).map((i: ApiOrderItem) => ({
                product: {
                  id: i.productId || 'prod',
                  name: i.productName || 'Therapeutic Formulation',
                  price: i.unitPrice ?? 0,
                  image: '/images/products/product_placeholder.png',
                  type: 'Prescription Medicine',
                },
                quantity: i.quantity ?? 1,
              })),
              subtotal: ord.subtotal ?? ord.totalAmount ?? 0,
              shipping: ord.shippingAmount ?? 0,
              tax: ord.taxAmount ?? 0,
              total: ord.totalAmount ?? 0,
              shippingForm: {
                fullName: ord.shippingAddress?.fullName || 'Customer',
                email: ord.shippingAddress?.email || '',
                phone: ord.shippingAddress?.phone || '',
                address: ord.shippingAddress?.street || '',
                city: ord.shippingAddress?.city || '',
                zipCode: ord.shippingAddress?.pincode || '',
              },
              date: ord.createdAt || new Date().toISOString(),
              status: (ord.status as OrderData['status']) ?? 'pending',
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to retrieve verified order for success view:', err);
      } finally {
        setLoading(false);
      }
    }

    void loadSuccessOrder();
  }, [targetId]);

  const handleCopyOrderId = () => {
    if (!order?.orderId) return;
    void navigator.clipboard.writeText(order.orderId);
    setCopiedId(true);
    setTimeout(() => {
      setCopiedId(false);
    }, 2000);
  };

  const handlePrintInvoice = () => {
    if (!order) return;
    generateInvoicePDF(order);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wellness-white text-wellness-charcoal flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-wellness-green/20 border-t-wellness-green rounded-full animate-spin" />
        <p className="mt-4 text-xs font-bold text-wellness-navy uppercase tracking-widest">
          Retrieving Order Confirmation...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-wellness-white text-wellness-charcoal flex items-center justify-center px-4 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-wellness-gray-200 p-8 sm:p-10 rounded-3xl text-center space-y-6 shadow-2xl glass-premium relative overflow-hidden"
        >
          <div className="w-20 h-20 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
            <Clock size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-extrabold tracking-tight text-wellness-navy">
              No Active Session Order
            </h2>
            <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-medium">
              We couldn't locate recent order receipt details in this session. Your order may have
              already been archived to your account history.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-wellness-navy hover:bg-wellness-green text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-xs w-full justify-center cursor-pointer"
            >
              <span>Explore Products Catalog</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 border border-wellness-gray-200 hover:bg-wellness-gray-50 text-wellness-navy px-6 py-3 rounded-xl font-bold transition-all text-xs w-full justify-center cursor-pointer"
            >
              <FileText size={14} />
              <span>View Account Orders</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-wellness-charcoal pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Hero Confirmation Card */}
        <OrderSuccessHeader
          order={order}
          copiedId={copiedId}
          onCopyOrderId={handleCopyOrderId}
          onPrintInvoice={handlePrintInvoice}
        />

        {/* Main Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Timeline & Ordered Items (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <OrderSuccessTimeline order={order} />
            <OrderSuccessItemsCard order={order} />
          </div>

          {/* Right Column: Delivery Address & Payment Breakdown (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <OrderSuccessSidebar order={order} />
          </div>
        </div>

        {/* Bottom Nav Buttons */}
        <OrderSuccessActions />
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-wellness-navy">
          <Clock size={32} className="animate-spin text-emerald-600 mb-4" />
          <p className="text-sm font-extrabold uppercase tracking-wider">
            Loading Order Confirmation...
          </p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
