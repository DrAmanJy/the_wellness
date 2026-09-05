'use client';

import { AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';

import AccountAuthCard from './components/AccountAuthCard';
import AccountHeader from './components/AccountHeader';
import AccountSidebar from './components/AccountSidebar';
import AddressesTab from './components/tabs/AddressesTab';
import OrdersTab from './components/tabs/OrdersTab';
import ProfileTab from './components/tabs/ProfileTab';
import type {
  AccountTab,
  Address,
  AccountAddressFormData,
  OrderData,
  ApiOrderDTO,
  ApiOrderItem,
} from './types';

import { authClient } from '@/lib/auth-client';
import { useAppSelector } from '@/lib/redux/hooks';

export default function AccountPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const reduxSession = useAppSelector((state) => state.auth.session);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const session = user && reduxSession ? { user, session: reduxSession } : null;

  const userRole = user?.role;
  const userEmail = user?.email;

  // Redirect admin users to admin portal
  useEffect(() => {
    if (userRole === 'admin' || userEmail === 'admin@thewellness.com') {
      router.push('/admin');
    }
  }, [userRole, userEmail, router]);

  const isSessionPending = !isInitialized;
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Auth Form State
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const loadUserAddresses = useCallback(async () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${backendUrl}/api/customer/addresses`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: Array<{
            id: string;
            fullName?: string;
            phone?: string;
            street?: string;
            city?: string;
            pincode?: string;
          }>;
        };
        if (json.success && Array.isArray(json.data)) {
          const mapped: Address[] = json.data.map((a, idx) => ({
            id: a.id,
            fullName: a.fullName || user?.name || 'Customer',
            email: user?.email || '',
            phone: a.phone || '',
            address: a.street || '',
            city: a.city || '',
            zipCode: a.pincode || '',
            isDefault: idx === 0,
          }));
          setAddresses(mapped);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to fetch addresses from API:', e);
    }
    setAddresses([]);
  }, [user?.name, user?.email]);

  useEffect(() => {
    async function loadUserOrders() {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      try {
        const res = await fetch(`${backendUrl}/api/orders`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = (await res.json()) as { success?: boolean; data?: ApiOrderDTO[] };
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mappedOrders: OrderData[] = json.data.map((ord) => ({
              orderId: ord.id,
              paymentId:
                ord.payment?.transactionId ||
                ord.payment?.razorpayPaymentId ||
                ord.payment?.provider ||
                'PAID',
              items: (ord.items || []).map((item: ApiOrderItem) => ({
                product: {
                  id: item.productId,
                  name: item.productName || 'Therapeutic Formulation',
                  price: item.unitPrice,
                  image: '/images/products/product_placeholder.png',
                  type: 'Prescription Medicine',
                },
                quantity: item.quantity,
              })),
              subtotal: ord.subtotal ?? ord.totalAmount ?? 0,
              shipping: ord.shippingAmount ?? 0,
              tax: ord.taxAmount ?? 0,
              total: ord.totalAmount ?? ord.price ?? 0,
              shippingForm: {
                fullName: ord.shippingAddress?.fullName || user?.name || 'Customer',
                email: ord.shippingAddress?.email || user?.email || '',
                phone: ord.shippingAddress?.phone || '',
                address: ord.shippingAddress?.street || '',
                city: ord.shippingAddress?.city || '',
                zipCode: ord.shippingAddress?.pincode || '',
              },
              date: ord.createdAt,
              status: ord.status as 'pending' | 'confirmed' | 'delivered' | 'cancelled',
            }));

            setOrders(mappedOrders);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch user orders from API:', e);
      }
    }

    if (user?.id) {
      void loadUserOrders();
      void loadUserAddresses();
    }
  }, [user?.id, user?.name, user?.email, loadUserAddresses]);

  // Address Actions
  const handleAddAddress = async (data: AccountAddressFormData) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      await fetch(`${backendUrl}/api/customer/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          street: data.address,
          city: data.city,
          state: 'State',
          pincode: data.zipCode,
          country: 'India',
        }),
      });
      if (user?.id) {
        await loadUserAddresses();
      }
    } catch (e) {
      console.error('Failed to add address to API:', e);
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
  };

  const handleDeleteAddress = async (id: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      await fetch(`${backendUrl}/api/customer/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    } catch (e) {
      console.error('Failed to delete address:', e);
    }
  };

  // OAuth Sign-In handler
  const handleOAuthSignIn = async (provider: 'google') => {
    setIsSubmittingAuth(true);
    setAuthError('');

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: `http://localhost:3000/account`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed.';
      setAuthError(msg);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setActiveTab('orders');
    } catch (e) {
      console.error(e);
    }
  };

  // Loading state
  if (isSessionPending) {
    return (
      <div className="min-h-screen bg-wellness-white text-wellness-charcoal flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-wellness-green/30 border-t-wellness-green rounded-full animate-spin"></div>
      </div>
    );
  }

  // Unauthenticated
  if (!session) {
    return (
      <AccountAuthCard
        authError={authError}
        isSubmittingAuth={isSubmittingAuth}
        onOAuthSignIn={handleOAuthSignIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-wellness-white text-wellness-charcoal pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <AccountHeader user={session.user} onSignOut={handleSignOut} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <AccountSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            ordersCount={orders.length}
            addressesCount={addresses.length}
          />

          <div className="md:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && <OrdersTab orders={orders} />}

              {activeTab === 'addresses' && (
                <AddressesTab
                  addresses={addresses}
                  onAddAddress={handleAddAddress}
                  onSetDefaultAddress={handleSetDefaultAddress}
                  onDeleteAddress={handleDeleteAddress}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab user={session.user} onSignOut={handleSignOut} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
