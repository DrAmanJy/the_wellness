'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  Lock,
  ShieldCheck,
  AlertCircle,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import React, { useState, useEffect } from 'react';

import { useCart } from '@/context/CartContext';
import { authClient } from '@/lib/auth-client';

type Step = 'review' | 'shipping' | 'payment';

export default function OrderPage() {
  const { cartItems, cartSubtotal, hasRxItems, clearCart } = useCart();
  const { data: session } = authClient.useSession();
  const [currentStep, setCurrentStep] = useState<Step>('review');
  const [rxFile, setRxFile] = useState<File | null>(null);
  const [rxFileName, setRxFileName] = useState<string>('');
  const [rxError, setRxError] = useState<string>('');

  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  // Pre-fill shipping form if user is logged in
  useEffect(() => {
    if (session?.user) {
      setShippingForm((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user.name || '',
        email: prev.email || session.user.email || '',
      }));
    }
  }, [session]);
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // Razorpay Payment State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentError, setPaymentError] = useState<string>('');

  // Calculate pricing values
  const shippingCost = cartSubtotal > 4000 || cartSubtotal === 0 ? 0 : 400;
  const taxCost = cartSubtotal * 0.1; // 10% tax
  const totalCost = cartSubtotal + shippingCost + taxCost;

  // Handle Prescription Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setRxError('File size exceeds the 5MB limit.');
        return;
      }
      setRxFile(file);
      setRxFileName(file.name);
      setRxError('');
    }
  };

  const triggerSimulatedUpload = () => {
    setRxFileName('medical_prescription_certified.pdf');
    setRxFile(new File([], 'medical_prescription_certified.pdf'));
    setRxError('');
  };

  // Validate Shipping form
  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingForm.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!shippingForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingForm.email)) {
      errors.email = 'Invalid email address';
    }
    if (!shippingForm.phone.trim()) errors.phone = 'Phone number is required';
    if (!shippingForm.address.trim()) errors.address = 'Street address is required';
    if (!shippingForm.city.trim()) errors.city = 'City is required';
    if (!shippingForm.zipCode.trim()) errors.zipCode = 'ZIP Code is required';

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper to save order and address details to user history in localStorage
  const saveOrderToHistory = (orderData: any) => {
    try {
      // Save last order
      localStorage.setItem('last_order', JSON.stringify(orderData));

      // Save to order history list
      const historyJson = localStorage.getItem('orders_history');
      const history = historyJson ? JSON.parse(historyJson) : [];
      history.unshift(orderData); // Add new order at the beginning
      localStorage.setItem('orders_history', JSON.stringify(history));

      // Save shipping address
      const addressesJson = localStorage.getItem('saved_addresses');
      const addresses = addressesJson ? JSON.parse(addressesJson) : [];

      const isExist = addresses.some(
        (addr: any) =>
          addr.address.toLowerCase() === orderData.shippingForm.address.toLowerCase() &&
          addr.zipCode === orderData.shippingForm.zipCode,
      );
      if (!isExist) {
        addresses.push({
          id: `addr_${Math.random().toString(36).substring(2, 9)}`,
          ...orderData.shippingForm,
          isDefault: addresses.length === 0,
        });
        localStorage.setItem('saved_addresses', JSON.stringify(addresses));
      }
    } catch (e) {
      console.error('Failed to save order/address to history:', e);
    }
  };

  // Razorpay payment handler
  const handlePayment = async () => {
    setIsSubmitting(true);
    setPaymentError('');
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/payments/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: totalCost }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment. Please try again.');
      }

      const data = await response.json();

      if (data.isMock) {
        // Automatically simulate payment success without showing any simulator page!
        const generatedPayId = `pay_mock_${Math.random().toString(36).substring(2, 16).toUpperCase()}`;
        const mockOrderId = data.id || `WILL-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;
        const orderData = {
          orderId: mockOrderId,
          paymentId: generatedPayId,
          items: cartItems,
          subtotal: cartSubtotal,
          shipping: shippingCost,
          tax: taxCost,
          total: totalCost,
          shippingForm: shippingForm,
          date: new Date().toISOString(),
          isMock: true,
          status: 'pending',
          hasRxItems: hasRxItems,
          rxFileName: hasRxItems ? rxFileName || 'medical_prescription_certified.pdf' : null,
        };

        setTimeout(() => {
          saveOrderToHistory(orderData);
          clearCart();
          window.location.href = `/order/success`;
        }, 1500);
        return;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        throw new Error('Razorpay Client Key ID is missing in environment.');
      }

      const options = {
        key: keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'The Wellness Platform',
        description: 'Premium Healthcare Purchase',
        order_id: data.id,
        handler: function (paymentResponse: any) {
          const orderData = {
            orderId: data.id,
            paymentId: paymentResponse.razorpay_payment_id,
            items: cartItems,
            subtotal: cartSubtotal,
            shipping: shippingCost,
            tax: taxCost,
            total: totalCost,
            shippingForm: shippingForm,
            date: new Date().toISOString(),
            isMock: false,
            status: 'pending',
            hasRxItems: hasRxItems,
            rxFileName: hasRxItems ? rxFileName || 'medical_prescription_certified.pdf' : null,
          };
          saveOrderToHistory(orderData);

          clearCart();
          window.location.href = `/order/success`;
        },
        prefill: {
          name: shippingForm.fullName,
          email: shippingForm.email,
          contact: shippingForm.phone,
        },
        notes: {
          address: `${shippingForm.address}, ${shippingForm.city} - ${shippingForm.zipCode}`,
        },
        theme: {
          color: '#2B7A78', // brand color (wellness green)
        },
        modal: {
          ondismiss: function () {
            window.location.href = `/products`;
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (errResponse: any) {
        console.error('Payment failed:', errResponse.error);
        window.location.href = `/products`;
      });

      rzp.open();
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setPaymentError(err.message || 'Payment initialization failed. Please retry.');
      setIsSubmitting(false);
    }
  };

  // Step Navigations
  const handleReviewSubmit = () => {
    if (hasRxItems && !rxFile) {
      setRxError('Please upload a valid prescription before proceeding.');
      return;
    }
    setCurrentStep('shipping');
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setCurrentStep('payment');
    }
  };

  // Render Page Content based on Step
  if (cartItems.length === 0) {
    return (
      <div className="pt-12 pb-24 min-h-screen bg-wellness-white flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-wellness-gray-100 flex items-center justify-center mx-auto mb-8 text-wellness-charcoal/30">
            <Package size={40} />
          </div>
          <h1 className="text-3xl font-heading font-bold text-wellness-navy mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-wellness-charcoal/70 mb-8 font-medium">
            You cannot place an order without items in your shopping cart. Browse our medicinal
            products and add them to your cart.
          </p>
          <Link
            href="/products"
            className="inline-block bg-wellness-green hover:bg-wellness-navy text-white px-8 py-4 rounded-md font-semibold transition-colors shadow-md"
          >
            Go to Product Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-24 min-h-screen bg-wellness-white">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        {/* Step Indicator */}
        {true && (
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    currentStep === 'review'
                      ? 'bg-wellness-green text-white shadow-md'
                      : 'bg-wellness-navy text-white'
                  }`}
                >
                  1
                </div>
                <span className="text-[11px] font-bold text-wellness-navy uppercase tracking-wider mt-2">
                  Review & Rx
                </span>
              </div>
              <div className="flex-grow h-0.5 mx-4 bg-wellness-gray-200"></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    currentStep === 'shipping'
                      ? 'bg-wellness-green text-white shadow-md'
                      : currentStep === 'payment'
                        ? 'bg-wellness-navy text-white'
                        : 'bg-wellness-gray-200 text-wellness-charcoal/40'
                  }`}
                >
                  2
                </div>
                <span className="text-[11px] font-bold text-wellness-navy uppercase tracking-wider mt-2">
                  Shipping
                </span>
              </div>
              <div className="flex-grow h-0.5 mx-4 bg-wellness-gray-200"></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    currentStep === 'payment'
                      ? 'bg-wellness-green text-white shadow-md'
                      : 'bg-wellness-gray-200 text-wellness-charcoal/40'
                  }`}
                >
                  3
                </div>
                <span className="text-[11px] font-bold text-wellness-navy uppercase tracking-wider mt-2">
                  Payment
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form Area */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {/* STEP 1: REVIEW & PRESCRIPTION */}
              {currentStep === 'review' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-wellness-navy mb-2">
                      Review Your Order
                    </h2>
                    <p className="text-wellness-charcoal/70">
                      Verify your cart contents and provide prescription details if required.
                    </p>
                  </div>

                  {/* Prescription Upload Zone */}
                  {hasRxItems ? (
                    <div className="bg-white border border-wellness-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500">
                        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                        <div>
                          <h3 className="font-heading font-bold text-amber-800 text-sm uppercase tracking-wider">
                            Prescription (Rx) Required
                          </h3>
                          <p className="text-xs text-amber-700 mt-1 leading-relaxed font-medium">
                            Your order contains regulated prescription drugs. Please upload a
                            scanned copy of your doctor's official prescription (PDF, JPEG, or PNG)
                            to continue.
                          </p>
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-wellness-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center hover:border-wellness-green transition-colors relative bg-wellness-gray-50/50">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-wellness-green mb-4">
                          <Upload size={24} />
                        </div>
                        <h4 className="font-heading font-bold text-wellness-navy text-base mb-1">
                          Drag & Drop or Click to Upload
                        </h4>
                        <p className="text-xs text-wellness-charcoal/50 mb-4">
                          Supports PDF, PNG, JPG (Max 5MB)
                        </p>

                        {rxFileName && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-wellness-green/10 text-wellness-green font-semibold rounded-lg text-sm">
                            <CheckCircle2 size={16} />
                            <span>{rxFileName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <span className="text-xs text-wellness-charcoal/50 font-medium">
                          No prescription file handy?
                        </span>
                        <button
                          type="button"
                          onClick={triggerSimulatedUpload}
                          className="text-xs font-bold text-wellness-green hover:text-wellness-navy border border-wellness-green px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Simulate Verified Prescription
                        </button>
                      </div>

                      {rxError && (
                        <p className="text-xs font-bold text-red-500 flex items-center gap-1.5 mt-2">
                          <AlertCircle size={14} />
                          {rxError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border border-wellness-gray-200 rounded-2xl p-6 flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-wellness-green/10 text-wellness-green flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-wellness-navy text-sm">
                          OTC Items Only
                        </h3>
                        <p className="text-xs text-wellness-charcoal/60 leading-relaxed mt-0.5">
                          Your cart only contains Over-The-Counter wellness products. No medical
                          prescription is required.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-wellness-charcoal/60 hover:text-wellness-navy transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Back to Shop
                    </Link>
                    <button
                      onClick={handleReviewSubmit}
                      className="bg-wellness-green hover:bg-wellness-navy text-white px-8 py-4 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
                    >
                      <span>Shipping Address</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SHIPPING DETAILS */}
              {currentStep === 'shipping' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-wellness-navy mb-2">
                      Shipping Information
                    </h2>
                    <p className="text-wellness-charcoal/70">
                      Please specify the destination address for your pharmaceutical delivery.
                    </p>
                  </div>

                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div className="bg-white border border-wellness-gray-200 rounded-2xl p-6 md:p-8 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={shippingForm.fullName}
                            onChange={(e) => {
                              setShippingForm({ ...shippingForm, fullName: e.target.value });
                            }}
                            className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                              shippingErrors.fullName
                                ? 'border-red-400'
                                : 'border-wellness-gray-200'
                            }`}
                            placeholder="John Doe"
                          />
                          {shippingErrors.fullName && (
                            <p className="text-[10px] text-red-500 font-semibold">
                              {shippingErrors.fullName}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={shippingForm.email}
                            onChange={(e) => {
                              setShippingForm({ ...shippingForm, email: e.target.value });
                            }}
                            className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                              shippingErrors.email ? 'border-red-400' : 'border-wellness-gray-200'
                            }`}
                            placeholder="john@example.com"
                          />
                          {shippingErrors.email && (
                            <p className="text-[10px] text-red-500 font-semibold">
                              {shippingErrors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={shippingForm.phone}
                          onChange={(e) => {
                            setShippingForm({ ...shippingForm, phone: e.target.value });
                          }}
                          className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                            shippingErrors.phone ? 'border-red-400' : 'border-wellness-gray-200'
                          }`}
                          placeholder="+1 (555) 123-4567"
                        />
                        {shippingErrors.phone && (
                          <p className="text-[10px] text-red-500 font-semibold">
                            {shippingErrors.phone}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={shippingForm.address}
                          onChange={(e) => {
                            setShippingForm({ ...shippingForm, address: e.target.value });
                          }}
                          className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                            shippingErrors.address ? 'border-red-400' : 'border-wellness-gray-200'
                          }`}
                          placeholder="123 Main St, Apt 4B"
                        />
                        {shippingErrors.address && (
                          <p className="text-[10px] text-red-500 font-semibold">
                            {shippingErrors.address}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                            City
                          </label>
                          <input
                            type="text"
                            value={shippingForm.city}
                            onChange={(e) => {
                              setShippingForm({ ...shippingForm, city: e.target.value });
                            }}
                            className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                              shippingErrors.city ? 'border-red-400' : 'border-wellness-gray-200'
                            }`}
                            placeholder="New York"
                          />
                          {shippingErrors.city && (
                            <p className="text-[10px] text-red-500 font-semibold">
                              {shippingErrors.city}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={shippingForm.zipCode}
                            onChange={(e) => {
                              setShippingForm({ ...shippingForm, zipCode: e.target.value });
                            }}
                            className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                              shippingErrors.zipCode ? 'border-red-400' : 'border-wellness-gray-200'
                            }`}
                            placeholder="10001"
                          />
                          {shippingErrors.zipCode && (
                            <p className="text-[10px] text-red-500 font-semibold">
                              {shippingErrors.zipCode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep('review');
                        }}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-wellness-charcoal/60 hover:text-wellness-navy transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={16} />
                        Back to Review
                      </button>
                      <button
                        type="submit"
                        className="bg-wellness-green hover:bg-wellness-navy text-white px-8 py-4 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
                      >
                        <span>Continue to Payment</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: SECURE PAYMENT */}
              {currentStep === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <Script
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    strategy="lazyOnload"
                  />

                  <div>
                    <h2 className="text-3xl font-heading font-bold text-wellness-navy mb-2">
                      Secure Checkout
                    </h2>
                    <p className="text-wellness-charcoal/70">
                      Complete your therapeutic order securely with the Razorpay gateway.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Redesigned Premium Payment Box */}
                    <div className="bg-white/80 backdrop-blur-md border border-wellness-gray-200 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm">
                      <div className="flex items-center justify-between border-b border-wellness-gray-100 pb-5">
                        <div className="flex items-center gap-2">
                          <span className="font-sans italic font-black tracking-tight text-[#3399cc] text-2xl">
                            Razorpay
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Official Integration
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-wellness-green bg-wellness-green/10 px-3 py-1 rounded-full text-xs font-bold">
                          <ShieldCheck size={16} />
                          <span>Secure SSL</span>
                        </div>
                      </div>

                      {/* Billing Information Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-wellness-gray-50/50 p-5 rounded-2xl border border-wellness-gray-100">
                        <div>
                          <h4 className="text-[10px] font-bold text-wellness-charcoal/40 uppercase tracking-widest mb-2">
                            Delivery Recipient
                          </h4>
                          <p className="text-sm font-bold text-wellness-navy">
                            {shippingForm.fullName}
                          </p>
                          <p className="text-xs text-wellness-charcoal/70 mt-1 font-medium">
                            {shippingForm.phone}
                          </p>
                          <p className="text-xs text-wellness-charcoal/70 font-medium">
                            {shippingForm.email}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-wellness-charcoal/40 uppercase tracking-widest mb-2">
                            Shipping Destination
                          </h4>
                          <p className="text-xs text-wellness-charcoal/70 font-medium leading-relaxed font-sans">
                            {shippingForm.address},<br />
                            {shippingForm.city} - {shippingForm.zipCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-baseline sm:justify-between gap-2 border-b border-wellness-gray-100 pb-5">
                        <div>
                          <span className="text-xs text-wellness-charcoal/50 uppercase tracking-widest font-bold">
                            Grand Total (INR)
                          </span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-heading font-extrabold text-wellness-navy">
                              ₹{totalCost.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-wellness-charcoal/50 font-semibold sm:text-right">
                          Includes 10% tax and shipping fee
                        </div>
                      </div>

                      {paymentError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
                          <AlertCircle className="shrink-0 text-red-500" size={16} />
                          <div>{paymentError}</div>
                        </div>
                      )}

                      {/* Checkout Action Button */}
                      <button
                        type="button"
                        onClick={handlePayment}
                        disabled={isSubmitting}
                        className="w-full bg-wellness-navy hover:bg-wellness-green text-white py-4.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        ) : (
                          <>
                            <Lock
                              size={18}
                              className="text-wellness-light-green group-hover:text-white transition-colors"
                            />
                            <span>Authenticate & Pay</span>
                          </>
                        )}
                      </button>

                      {/* Informational Warning / Test Notice */}
                      <div className="text-center">
                        <p className="text-[10px] text-wellness-charcoal/40 font-semibold">
                          By clicking above, the official Razorpay Checkout interface will open.
                        </p>
                        {(!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
                          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('dummy')) && (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-medium leading-relaxed">
                            💡 <strong>Dev Notice:</strong> Razorpay credentials are not configured
                            in environment variables. Clicking pay will automatically simulate a
                            successful checkout.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep('shipping');
                        }}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-wellness-charcoal/60 hover:text-wellness-navy transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={16} />
                        Back to Shipping
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Order Summary (visible in checkout steps) */}
          {true && (
            <div className="lg:col-span-5">
              <div className="bg-wellness-gray-50 border border-wellness-gray-200 rounded-2xl p-6 md:p-8 space-y-6 sticky top-40">
                <h3 className="text-lg font-heading font-bold text-wellness-navy border-b border-wellness-gray-200 pb-3 flex items-center gap-2">
                  <Package size={20} />
                  <span>Order Summary</span>
                </h3>

                {/* Items list */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-4 items-center">
                      <div className="relative w-12 h-12 bg-white rounded border border-wellness-gray-200 overflow-hidden shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-bold text-wellness-navy truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-wellness-navy bg-wellness-gray-200/60 px-1.5 py-0.2 rounded uppercase tracking-wider">
                            {item.product.type}
                          </span>
                          <span className="text-[10px] text-wellness-charcoal/50 font-medium">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-wellness-navy shrink-0">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Costs breakdown */}
                <div className="border-t border-wellness-gray-200 pt-4 space-y-2 text-xs font-medium text-wellness-charcoal/70">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-wellness-navy font-bold">₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    {shippingCost === 0 ? (
                      <span className="text-wellness-green font-bold uppercase tracking-wider">
                        Free
                      </span>
                    ) : (
                      <span className="text-wellness-navy font-bold">
                        ₹{shippingCost.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span className="text-wellness-navy font-bold">₹{taxCost.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-wellness-gray-200 pt-3 flex justify-between text-sm font-heading font-bold text-wellness-navy">
                    <span>Total Amount</span>
                    <span>₹{totalCost.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust badge */}
                <div className="flex items-center gap-2.5 justify-center pt-2 text-[10px] text-wellness-charcoal/40 font-bold uppercase tracking-wider border-t border-wellness-gray-200/50">
                  <Lock size={12} />
                  <span>256-bit SSL Encryption</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
