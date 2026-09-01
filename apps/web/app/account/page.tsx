'use client';

import {
  User,
  ShoppingBag,
  MapPin,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  Sparkles,
  Package,
  Lock,
  ChevronDown,
  ChevronUp,
  LogOut,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { authClient } from '@/lib/auth-client';
import { useAppSelector } from '@/lib/redux/hooks';

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
  isMock?: boolean;
  status?: 'pending' | 'confirmed' | 'cancelled';
  hasRxItems?: boolean;
  rxFileName?: string | null;
}

interface Address {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  isDefault?: boolean;
}

export default function AccountPage() {
  const { user, session: reduxSession, isInitialized } = useAppSelector((state) => state.auth);
  const session = user && reduxSession ? { user, session: reduxSession } : null;
  const isSessionPending = !isInitialized;
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Auth Form State
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load orders and addresses from localStorage
    const savedOrders = localStorage.getItem('orders_history');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders) as OrderData[]);
      } catch (e) {
        console.error(e);
      }
    }

    const savedAddresses = localStorage.getItem('saved_addresses');
    if (savedAddresses) {
      try {
        setAddresses(JSON.parse(savedAddresses) as Address[]);
      } catch (e) {
        console.error(e);
      }
    }
  }, [session]);

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Address Actions
  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem('saved_addresses', JSON.stringify(updated));
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((addr) => addr.id !== id);
    if (updated.length > 0 && !updated.some((addr) => addr.isDefault)) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    localStorage.setItem('saved_addresses', JSON.stringify(updated));
  };

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!newAddress.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!newAddress.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newAddress.email)) {
      errors.email = 'Invalid email address';
    }
    if (!newAddress.phone.trim()) errors.phone = 'Phone number is required';
    if (!newAddress.address.trim()) errors.address = 'Street address is required';
    if (!newAddress.city.trim()) errors.city = 'City is required';
    if (!newAddress.zipCode.trim()) errors.zipCode = 'ZIP Code is required';

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    const newAddrItem: Address = {
      id: `addr_${Math.random().toString(36).substring(2, 9)}`,
      ...newAddress,
      isDefault: addresses.length === 0,
    };

    const updated = [...addresses, newAddrItem];
    setAddresses(updated);
    localStorage.setItem('saved_addresses', JSON.stringify(updated));

    // Reset Form
    setNewAddress({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
    });
    setShowAddressForm(false);
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

  // Clear demo data
  const handleResetDemoData = () => {
    if (
      confirm(
        'Are you sure you want to reset your account data? This will clear your order history and shipping addresses.',
      )
    ) {
      localStorage.removeItem('orders_history');
      localStorage.removeItem('saved_addresses');
      localStorage.removeItem('last_order');
      setOrders([]);
      setAddresses([]);
    }
  };

  // Show generic loading spinner during initial session lookup
  if (isSessionPending) {
    return (
      <div className="min-h-screen bg-wellness-white text-wellness-charcoal flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-wellness-green/30 border-t-wellness-green rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Login Form if no active session
  if (!session) {
    return (
      <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white text-wellness-charcoal font-sans">
        {/* Left column: Split screen Content & Image (takes 5 cols on lg) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-wellness-navy via-[#0C1B33] to-wellness-navy text-white flex-col justify-between p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-wellness-green/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-wellness-light-green/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative w-full aspect-square my-auto max-w-sm mx-auto overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center p-6 shadow-2xl">
            <Image
              src="/images/login_brand_visual.png"
              alt="Boutique Clinical Serum Formulation"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-heading font-black tracking-tight uppercase text-white">
              Boutique Formulation.
            </h3>
            <p className="text-xs text-wellness-light-green/70 leading-relaxed font-bold">
              The Wellness bridges advanced diagnostic parameters with boutique atelier
              manufacturing standards. Sign in to review your personalised clinical logs and
              formulations.
            </p>
          </div>

          <div className="relative z-10 text-[9px] text-white/30 font-bold tracking-widest uppercase border-t border-white/10 pt-6">
            © {new Date().getFullYear()} The Wellness Pvt Ltd. All rights reserved.
          </div>
        </div>

        {/* Right column: Login Card (takes 7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 relative bg-white min-h-screen">
          {/* Back to Home Button */}
          <Link
            href="/"
            className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-wellness-charcoal/60 hover:text-wellness-green transition-all group"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1 stroke-[2]"
            />
            <span>Back to Home</span>
          </Link>

          {/* Brand Logo & Name */}
          <div className="mb-10 flex flex-col items-center gap-3">
            <Link
              href="/"
              className="text-2xl font-heading font-black tracking-tight flex items-center gap-2.5 group/logo"
            >
              <div className="w-9 h-9 rounded-bl-xl rounded-tr-xl bg-wellness-green flex items-center justify-center transition-all duration-500 group-hover/logo:rotate-180 shadow-md shadow-wellness-green/10">
                <div className="w-3.5 h-3.5 rounded-full bg-white transition-colors duration-500"></div>
              </div>
              <span className="text-wellness-navy font-heading font-black">
                The Wellness<span className="text-wellness-green font-medium">.</span>
              </span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="w-full max-w-md relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-white border border-wellness-gray-200/80 p-8 sm:p-10 rounded-3xl shadow-xl shadow-wellness-navy/5 space-y-8"
            >
              {/* Card Header */}
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-heading font-black tracking-tight text-wellness-navy">
                  Welcome Back
                </h2>
                <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-semibold max-w-[320px] mx-auto">
                  Sign in to view your orders, track diagnostics, and manage prescriptions.
                </p>
              </div>

              {authError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-700 leading-normal font-semibold flex items-center gap-2 shadow-sm"
                >
                  <span className="text-base shrink-0">⚠️</span>
                  <span>{authError}</span>
                </motion.div>
              )}

              {/* OAuth buttons */}
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => {
                    void handleOAuthSignIn('google');
                  }}
                  disabled={isSubmittingAuth}
                  className="w-full flex items-center justify-center gap-3 border border-wellness-gray-200 bg-white hover:bg-wellness-navy hover:text-white hover:border-wellness-navy px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-wellness-navy cursor-pointer transition-all duration-300 hover:shadow-md disabled:opacity-50 group shadow-sm active:scale-[0.98]"
                >
                  {isSubmittingAuth ? (
                    <div className="w-4 h-4 border-2 border-wellness-navy/20 border-t-wellness-navy group-hover:border-white/20 group-hover:border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Authenticate with Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secure Patient Protocols */}
              <div className="space-y-3 pt-6 border-t border-wellness-gray-100/80">
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center gap-2.5 text-[11px] text-wellness-charcoal/60 font-semibold">
                    <ShieldCheck size={14} className="text-wellness-green shrink-0" />
                    <span>Secure HIPAA-aligned data systems</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-wellness-charcoal/60 font-semibold">
                    <Lock size={14} className="text-wellness-green shrink-0" />
                    <span>Encrypted single sign-on access</span>
                  </div>
                </div>
              </div>

              {/* Secure authentication note */}
              <div className="pt-2 text-center">
                <p className="text-[9px] text-wellness-charcoal/40 font-bold leading-relaxed">
                  Having trouble? Contact support at{' '}
                  <span className="text-wellness-navy font-extrabold">support@thewellness.com</span>
                  .
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Render main dashboard when authenticated
  return (
    <div className="min-h-screen bg-wellness-white text-wellness-charcoal pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Profile Summary */}
        <div className="relative bg-white/80 border border-wellness-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl glass-premium overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-wellness-green/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-wellness-light-green/40 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
            <div className="relative w-20 h-20 bg-wellness-green/10 border border-wellness-green/20 text-wellness-green rounded-full flex items-center justify-center shadow-inner overflow-hidden">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User size={36} className="stroke-[1.5]" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-heading font-extrabold text-wellness-navy">
                  Hello, {session.user.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-wellness-green tracking-widest bg-wellness-green/10 px-2.5 py-0.5 rounded-full">
                  <Sparkles size={8} />
                  <span>Explorer Tier</span>
                </span>
              </div>
              <p className="text-sm text-wellness-charcoal/60">
                Logged in as{' '}
                <span className="font-semibold text-wellness-navy">{session.user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10">
            {session.user.email === 'admin@thewellness.com' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-wellness-green hover:bg-wellness-navy px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <ShieldCheck size={12} />
                <span>Admin Panel</span>
              </Link>
            )}

            <button
              onClick={() => {
                void handleSignOut();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-wellness-navy hover:text-wellness-green bg-wellness-gray-100 hover:bg-wellness-gray-200 px-3.5 py-2 rounded-xl transition-all border border-wellness-gray-200 cursor-pointer"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>

            <button
              onClick={handleResetDemoData}
              className="text-xs font-bold text-red-500/60 hover:text-red-600 bg-red-50/50 hover:bg-red-50 px-3.5 py-2 rounded-xl transition-all border border-red-100/50 cursor-pointer"
            >
              Reset Demo
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar Tabs Selectors */}
          <div className="md:col-span-3 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none shrink-0">
            <button
              onClick={() => {
                setActiveTab('orders');
              }}
              className={`flex items-center justify-center md:justify-start gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all border w-full shrink-0 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-wellness-navy text-white shadow-md border-wellness-navy'
                  : 'bg-white/80 border-wellness-gray-200 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-white'
              }`}
            >
              <ShoppingBag size={18} />
              <span>Order History</span>
              {orders.length > 0 && (
                <span
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'orders'
                      ? 'bg-wellness-green text-white'
                      : 'bg-wellness-gray-100 text-wellness-charcoal/60'
                  }`}
                >
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('addresses');
              }}
              className={`flex items-center justify-center md:justify-start gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all border w-full shrink-0 cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-wellness-navy text-white shadow-md border-wellness-navy'
                  : 'bg-white/80 border-wellness-gray-200 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-white'
              }`}
            >
              <MapPin size={18} />
              <span>Addresses</span>
              {addresses.length > 0 && (
                <span
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'addresses'
                      ? 'bg-wellness-green text-white'
                      : 'bg-wellness-gray-100 text-wellness-charcoal/60'
                  }`}
                >
                  {addresses.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
              }}
              className={`flex items-center justify-center md:justify-start gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all border w-full shrink-0 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-wellness-navy text-white shadow-md border-wellness-navy'
                  : 'bg-white/80 border-wellness-gray-200 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-white'
              }`}
            >
              <User size={18} />
              <span>Profile Settings</span>
            </button>
          </div>

          {/* Main Dashboard Tabs Content */}
          <div className="md:col-span-9">
            <AnimatePresence mode="wait">
              {/* Tab 1: Orders list */}
              {activeTab === 'orders' && (
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
                          Your active orders and delivery status updates will display here once you
                          checkout.
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
                                          <div
                                            key={item.product.id}
                                            className="flex gap-3 items-center"
                                          >
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

                                      <div className="pt-2">
                                        <Link
                                          href="/order/success"
                                          onClick={() => {
                                            localStorage.setItem('last_order', JSON.stringify(ord));
                                          }}
                                          className="inline-flex items-center gap-1.5 text-wellness-green hover:text-wellness-navy transition-colors font-bold font-heading text-[11px] uppercase tracking-wider"
                                        >
                                          <span>Launch Tracking Timeline</span>
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
                                            {ord.shipping === 0
                                              ? 'Free'
                                              : `₹${ord.shipping.toFixed(2)}`}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-wellness-charcoal/60">
                                          <span>GST Tax (10%)</span>
                                          <span>₹{ord.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-wellness-navy pt-1.5 border-t border-dashed border-wellness-gray-200 text-sm">
                                          <span>Total Cost</span>
                                          <span className="text-wellness-green">
                                            ₹{ord.total.toFixed(2)}
                                          </span>
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
              )}

              {/* Tab 2: Addresses dashboard */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-heading font-extrabold text-wellness-navy">
                      Saved Addresses
                    </h3>
                    {!showAddressForm && (
                      <button
                        onClick={() => {
                          setShowAddressForm(true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-wellness-green hover:bg-wellness-navy text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add New</span>
                      </button>
                    )}
                  </div>

                  {/* Add Address Form Accordion */}
                  {showAddressForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white border border-wellness-gray-200 rounded-2xl p-6 shadow-md glass-premium"
                    >
                      <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
                        <h4 className="text-sm font-heading font-bold text-wellness-navy border-b border-wellness-gray-200 pb-2 mb-2">
                          New Delivery Address
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-wellness-charcoal/50 uppercase tracking-wide">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={newAddress.fullName}
                              onChange={(e) => {
                                setNewAddress({ ...newAddress, fullName: e.target.value });
                              }}
                              placeholder="Jane Doe"
                              className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                            />
                            {addressErrors.fullName && (
                              <p className="text-[10px] text-red-500 font-semibold">
                                {addressErrors.fullName}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-wellness-charcoal/50 uppercase tracking-wide">
                              Phone Number
                            </label>
                            <input
                              type="text"
                              value={newAddress.phone}
                              onChange={(e) => {
                                setNewAddress({ ...newAddress, phone: e.target.value });
                              }}
                              placeholder="9988776655"
                              className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                            />
                            {addressErrors.phone && (
                              <p className="text-[10px] text-red-500 font-semibold">
                                {addressErrors.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-wellness-charcoal/50 uppercase tracking-wide">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={newAddress.email}
                            onChange={(e) => {
                              setNewAddress({ ...newAddress, email: e.target.value });
                            }}
                            placeholder="jane@example.com"
                            className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                          />
                          {addressErrors.email && (
                            <p className="text-[10px] text-red-500 font-semibold">
                              {addressErrors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-wellness-charcoal/50 uppercase tracking-wide">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={newAddress.address}
                            onChange={(e) => {
                              setNewAddress({ ...newAddress, address: e.target.value });
                            }}
                            placeholder="Flat/House No, Building, Street Name"
                            className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                          />
                          {addressErrors.address && (
                            <p className="text-[10px] text-red-500 font-semibold">
                              {addressErrors.address}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-wellness-charcoal/50 uppercase tracking-wide">
                              City
                            </label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => {
                                setNewAddress({ ...newAddress, city: e.target.value });
                              }}
                              placeholder="Mumbai"
                              className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                            />
                            {addressErrors.city && (
                              <p className="text-[10px] text-red-500 font-semibold">
                                {addressErrors.city}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-wellness-charcoal/50 uppercase tracking-wide">
                              ZIP Code
                            </label>
                            <input
                              type="text"
                              value={newAddress.zipCode}
                              onChange={(e) => {
                                setNewAddress({ ...newAddress, zipCode: e.target.value });
                              }}
                              placeholder="400001"
                              className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                            />
                            {addressErrors.zipCode && (
                              <p className="text-[10px] text-red-500 font-semibold">
                                {addressErrors.zipCode}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                            }}
                            className="px-5 py-2.5 rounded-xl border border-wellness-gray-200 hover:bg-wellness-gray-50 text-wellness-charcoal font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-wellness-green hover:bg-wellness-navy text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {addresses.length === 0 ? (
                    <div className="bg-white/80 border border-wellness-gray-200 p-12 rounded-3xl text-center space-y-4 shadow-lg glass-premium">
                      <div className="w-16 h-16 bg-wellness-gray-100 text-wellness-charcoal/30 rounded-full flex items-center justify-center mx-auto border border-wellness-gray-200">
                        <MapPin size={28} />
                      </div>
                      <div className="space-y-1 max-w-sm mx-auto">
                        <h3 className="text-base font-bold text-wellness-navy">
                          No Addresses Saved Yet
                        </h3>
                        <p className="text-xs text-wellness-charcoal/60 leading-relaxed">
                          Your delivery addresses will automatically save here upon order
                          completion, or you can add them manually.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`bg-white border rounded-2xl p-5 space-y-4 shadow-sm relative transition-all ${
                            addr.isDefault
                              ? 'border-wellness-green bg-wellness-light-green/10'
                              : 'border-wellness-gray-200 hover:border-wellness-charcoal/30'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-wellness-navy">
                                  {addr.fullName}
                                </h4>
                                {addr.isDefault && (
                                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-wellness-green bg-wellness-green/15 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                    <Check size={8} />
                                    <span>Default</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-wellness-charcoal/50 leading-relaxed font-sans mt-1">
                                {addr.address},<br />
                                {addr.city} - {addr.zipCode}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                handleDeleteAddress(addr.id);
                              }}
                              className="text-wellness-charcoal/30 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50/50 cursor-pointer"
                              title="Delete Address"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex justify-between items-center text-[10px] pt-3 border-t border-wellness-gray-100 font-semibold text-wellness-charcoal/60">
                            <div className="flex gap-4">
                              <span className="flex items-center gap-1">
                                <Phone size={10} /> {addr.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail size={10} /> {addr.email}
                              </span>
                            </div>

                            {!addr.isDefault && (
                              <button
                                onClick={() => {
                                  handleSetDefaultAddress(addr.id);
                                }}
                                className="text-wellness-green hover:underline cursor-pointer font-bold"
                              >
                                Set Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 3: Profile Settings */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/80 border border-wellness-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg glass-premium"
                >
                  <div className="border-b border-wellness-gray-200 pb-4">
                    <h3 className="text-lg font-heading font-extrabold text-wellness-navy">
                      Profile Details
                    </h3>
                    <p className="text-xs text-wellness-charcoal/50 mt-0.5">
                      Your personal healthcare settings and dashboard configurations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-wellness-charcoal/80">
                    <div className="space-y-4">
                      <div>
                        <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                          Account Name
                        </p>
                        <p className="text-sm font-bold text-wellness-navy mt-1">
                          {session.user.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                          Primary Email
                        </p>
                        <p className="text-sm font-medium text-wellness-navy mt-1">
                          {session.user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                          Security Status
                        </p>
                        <p className="text-sm font-medium text-wellness-navy mt-1 flex items-center gap-1.5">
                          <UserCheck size={14} className="text-wellness-green" />
                          <span>Active Client Session</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                          Verification Status
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-wellness-green bg-wellness-green/10 px-2 py-0.5 rounded mt-1">
                          <Check size={10} className="stroke-[2.5]" />
                          <span>Better Auth Client Verified</span>
                        </span>
                      </div>
                      <div>
                        <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                          Prescription (Rx) Credentials
                        </p>
                        <p className="text-sm font-medium text-wellness-navy mt-1">
                          Status: Active
                        </p>
                      </div>
                      <div>
                        <p className="text-wellness-charcoal/40 font-bold uppercase tracking-wider text-[9px]">
                          Security & SSL
                        </p>
                        <p className="text-sm font-medium text-wellness-navy mt-1 flex items-center gap-1.5">
                          <Lock size={12} className="text-wellness-green" />
                          <span>256-bit Secure Session Active</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-wellness-gray-200 pt-6 flex justify-between items-center text-xs font-semibold text-wellness-charcoal/50">
                    <span>Account Tier: Explorer Member</span>
                    <button
                      onClick={() => {
                        void handleSignOut();
                      }}
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <LogOut size={10} />
                      <span>Sign Out from Device</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
