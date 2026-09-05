'use client';

import { ArrowLeft, RefreshCw, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

import type { ApiOrder, ApiOrderItem, OrderData } from '../types';
import OrderDeliveryCard from './components/OrderDeliveryCard';
import OrderItemsCard from './components/OrderItemsCard';
import OrderStatusHeader from './components/OrderStatusHeader';
import OrderStatusTimeline from './components/OrderStatusTimeline';

import { generateInvoicePDF } from '@/lib/invoiceGenerator';

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isSubscribed = true;

    async function loadOrderData() {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      try {
        let apiOrder: ApiOrder | null = null;

        if (targetId) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            targetId,
          );
          if (isUuid) {
            const res = await fetch(`${API_BASE}/api/orders/${targetId}`, {
              credentials: 'include',
            });
            if (res.ok) {
              const json = (await res.json()) as { success?: boolean; data?: ApiOrder };
              if (json.success && json.data) {
                apiOrder = json.data;
              }
            }
          }
        }

        if (!apiOrder) {
          const listRes = await fetch(`${API_BASE}/api/orders`, {
            credentials: 'include',
          });
          if (listRes.ok) {
            const json = (await listRes.json()) as { success?: boolean; data?: ApiOrder[] };
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              apiOrder = targetId
                ? json.data.find((o: ApiOrder) => o.id === targetId || o.orderId === targetId) ||
                  json.data[0]
                : json.data[0];
            }
          }
        }

        if (apiOrder && isSubscribed) {
          const rawStreet = apiOrder.shippingAddress?.street || '';
          let parsedFullName = apiOrder.shippingAddress?.fullName || '';
          let parsedPhone = apiOrder.shippingAddress?.phone || '';
          const parsedEmail = apiOrder.shippingAddress?.email || apiOrder.user?.email || '';
          let parsedAddress = rawStreet;

          if (rawStreet.includes(' | ')) {
            const parts = rawStreet.split(' | ');
            if (parts.length >= 3) {
              if (!parsedFullName || parsedFullName === 'Customer') {
                parsedFullName = parts[0];
              }
              if (!parsedPhone) {
                parsedPhone = parts[1];
              }
              parsedAddress = parts.slice(2).join(' | ');
            }
          }

          if (!parsedFullName || parsedFullName === 'Customer') {
            parsedFullName = apiOrder.user?.name || 'Customer';
          }

          const fetchedOrder: OrderData = {
            orderId: apiOrder.id,
            paymentId:
              apiOrder.payment?.razorpayPaymentId ||
              apiOrder.payment?.transactionId ||
              apiOrder.paymentId ||
              'pay_verified',
            items:
              apiOrder.items && apiOrder.items.length > 0
                ? apiOrder.items.map((item: ApiOrderItem) => ({
                    product: {
                      id: item.productId || item.product?.id || 'prod',
                      name: item.productName || item.product?.name || 'Wellness Item',
                      price: item.unitPrice || item.product?.price || 0,
                      image: item.product?.image || '/images/default-promo-banner.png',
                      type: item.product?.type || 'Therapeutic Product',
                    },
                    quantity: item.quantity || 1,
                  }))
                : [],
            subtotal: apiOrder.subtotal ?? apiOrder.totalAmount ?? 0,
            shipping: apiOrder.shippingAmount ?? 0,
            tax: apiOrder.taxAmount ?? 0,
            total: apiOrder.totalAmount ?? 0,
            shippingForm: {
              fullName: parsedFullName,
              email: parsedEmail,
              phone: parsedPhone,
              address: parsedAddress,
              city: apiOrder.shippingAddress?.city || '',
              zipCode: apiOrder.shippingAddress?.pincode || '',
            },
            date: apiOrder.createdAt || new Date().toISOString(),
            status: (apiOrder.status as OrderData['status']) ?? 'pending',
            statusHistory: Array.isArray(apiOrder.statusHistory) ? apiOrder.statusHistory : [],
          };

          setOrder(fetchedOrder);
        }
      } catch (err) {
        console.error('Failed to fetch real-time order status:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    void loadOrderData();

    // Auto-poll status every 5s while on tracking page
    const intervalId = setInterval(() => {
      void loadOrderData();
    }, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [targetId]);

  const handleCopyOrderId = () => {
    if (!order) return;
    void navigator.clipboard.writeText(order.orderId);
    setCopiedId(true);
    setTimeout(() => {
      setCopiedId(false);
    }, 2000);
  };

  const handlePrintInvoice = () => {
    if (order) {
      generateInvoicePDF(order);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-wellness-navy">
        <RefreshCw size={32} className="animate-spin text-wellness-green mb-4" />
        <p className="text-sm font-extrabold uppercase tracking-wider">Loading Order Progress...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <ShoppingBag size={48} className="mx-auto text-slate-300" />
        <h2 className="text-xl font-heading font-extrabold text-wellness-navy">No Order Found</h2>
        <p className="text-xs text-wellness-charcoal/60">
          We could not retrieve order tracking details.
        </p>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 bg-wellness-navy text-white px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and metadata */}
      <OrderStatusHeader
        order={order}
        copiedId={copiedId}
        onCopyOrderId={handleCopyOrderId}
        onPrintInvoice={handlePrintInvoice}
      />

      {/* Fulfillment progress timeline */}
      <OrderStatusTimeline order={order} />

      {/* Details Grid: Items & Shipping Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <OrderItemsCard order={order} />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <OrderDeliveryCard shippingForm={order.shippingForm} />
        </div>
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-wellness-navy">
          <RefreshCw size={32} className="animate-spin text-wellness-green mb-4" />
          <p className="text-sm font-extrabold uppercase tracking-wider">Loading Order Status...</p>
        </div>
      }
    >
      <OrderStatusContent />
    </Suspense>
  );
}
