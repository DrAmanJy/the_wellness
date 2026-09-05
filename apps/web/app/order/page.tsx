'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Lock } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import AuthRequiredModal from './components/AuthRequiredModal';
import OrderSummary from './components/OrderSummary';
import PaymentStep from './components/PaymentStep';
import ReviewStep from './components/ReviewStep';
import ShippingStep from './components/ShippingStep';
import StepIndicator from './components/StepIndicator';
import {
  orderShippingSchema,
  OrderShippingFormData,
  Step,
  ShippingForm,
  SavedAddress,
  OrderRecord,
  ApiOrderData,
} from './types';

import { useCart } from '@/context/CartContext';
import { authClient } from '@/lib/auth-client';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      on: (event: string, callback: (res: { error?: unknown }) => void) => void;
      open: () => void;
    };
  }
}

export default function OrderPage() {
  const { cartItems, cartSubtotal, hasRxItems, clearCart } = useCart();
  const { data: session } = authClient.useSession();
  const [currentStep, setCurrentStep] = useState<Step>('review');
  const [rxFile, setRxFile] = useState<File | null>(null);
  const [rxFileName, setRxFileName] = useState<string>('');
  const [rxError, setRxError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Shipping Form State (react-hook-form)
  const {
    register: registerShipping,
    handleSubmit: handleShippingSubmit,
    setValue: setShippingValue,
    watch: watchShipping,
    reset: resetShipping,
    formState: { errors: shippingErrors },
  } = useForm<OrderShippingFormData>({
    resolver: zodResolver(orderShippingSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const shippingForm = watchShipping();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user) {
      setShippingValue('fullName', session.user.name || '');
      setShippingValue('email', session.user.email || '');
    }
  }, [session, setShippingValue]);

  // Fetch saved addresses from Customer API, Order History, or fallback
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      const addresses: SavedAddress[] = [];
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      if (session?.user) {
        // 1. Fetch from Customer Addresses API
        try {
          const reqHeaders: Record<string, string> = {};
          if (session.session.token) {
            reqHeaders['Authorization'] = `Bearer ${session.session.token}`;
          }
          const res = await fetch(`${backendUrl}/api/customer/addresses`, {
            headers: reqHeaders,
            credentials: 'include',
          });
          if (res.ok) {
            const json = (await res.json()) as {
              success?: boolean;
              data?: Array<{
                id: string;
                fullName: string;
                phone: string;
                street: string;
                city: string;
                state: string;
                pincode: string;
              }>;
            };
            if (json.success && Array.isArray(json.data)) {
              json.data.forEach((item, idx) => {
                addresses.push({
                  id: item.id,
                  fullName: item.fullName || session.user.name || '',
                  email: session.user.email || '',
                  phone: item.phone || '',
                  address: item.street || '',
                  city: item.city || '',
                  state: item.state || '',
                  zipCode: item.pincode || '',
                  isDefault: idx === 0,
                });
              });
            }
          }
        } catch (e) {
          console.warn('Error fetching customer saved addresses:', e);
        }

        // 2. Fetch from DB orders if no customer addresses found
        if (addresses.length === 0) {
          try {
            const reqHeaders: Record<string, string> = {};
            if (session.session.token) {
              reqHeaders['Authorization'] = `Bearer ${session.session.token}`;
            }
            const oRes = await fetch(`${backendUrl}/api/orders`, {
              headers: reqHeaders,
              credentials: 'include',
            });
            if (oRes.ok) {
              const oJson = (await oRes.json()) as {
                success?: boolean;
                data?: Array<{
                  id?: string;
                  address?: {
                    street?: string;
                    city?: string;
                    state?: string;
                    pincode?: string;
                  };
                }>;
              };
              if (oJson.success && Array.isArray(oJson.data)) {
                const seenKeys = new Set<string>();
                oJson.data.forEach((ord, idx) => {
                  if (ord.address && ord.address.street) {
                    const parts = ord.address.street.split(' | ');
                    let fullName = session.user.name || '';
                    let phone = '';
                    let street = ord.address.street;
                    if (parts.length >= 3) {
                      fullName = parts[0];
                      phone = parts[1];
                      street = parts.slice(2).join(' | ');
                    }
                    const key = `${fullName}-${street}-${ord.address.pincode || ''}`;
                    if (!seenKeys.has(key)) {
                      seenKeys.add(key);
                      addresses.push({
                        id: ord.id || `ord-addr-${String(idx)}`,
                        fullName,
                        email: session.user.email || '',
                        phone,
                        address: street,
                        city: ord.address.city || '',
                        state: ord.address.state || '',
                        zipCode: ord.address.pincode || '',
                        isDefault: addresses.length === 0,
                      });
                    }
                  }
                });
              }
            }
          } catch (oErr) {
            console.warn('Error extracting addresses from order history:', oErr);
          }
        }
      }

      setSavedAddresses(addresses);
      if (addresses.length > 0) {
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        setSelectedAddressId(defaultAddr.id);
        resetShipping({
          fullName: defaultAddr.fullName,
          email: defaultAddr.email || session?.user.email || '',
          phone: defaultAddr.phone,
          address: defaultAddr.address,
          city: defaultAddr.city,
          state: defaultAddr.state,
          zipCode: defaultAddr.zipCode,
        });
        setIsAddingNewAddress(false);
      } else {
        setSelectedAddressId('new');
        setIsAddingNewAddress(true);
      }
    };

    void fetchSavedAddresses();
  }, [session, resetShipping]);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setIsAddingNewAddress(false);
    resetShipping({
      fullName: addr.fullName,
      email: addr.email || session?.user.email || '',
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
    });
  };

  const handleAddNewAddressClick = () => {
    setSelectedAddressId('new');
    setIsAddingNewAddress(true);
    resetShipping({
      fullName: session?.user.name || '',
      email: session?.user.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
  };

  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeSuccessMsg, setPincodeSuccessMsg] = useState('');
  const [pincodeErrorMsg, setPincodeErrorMsg] = useState('');

  const fetchLocationByPincode = async (code: string) => {
    const cleanCode = code.trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      if (cleanCode.length < 6) {
        setPincodeSuccessMsg('');
        setPincodeErrorMsg('');
      }
      return;
    }

    setIsFetchingPincode(true);
    setPincodeSuccessMsg('');
    setPincodeErrorMsg('');

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`);
      if (res.ok) {
        const data = (await res.json()) as Array<{
          Status?: string;
          PostOffice?: Array<{
            District?: string;
            Block?: string;
            Circle?: string;
            Name?: string;
            State?: string;
          }>;
        }>;

        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length) {
          const postOffice = data[0].PostOffice[0];
          const cityFound =
            postOffice.District || postOffice.Block || postOffice.Circle || postOffice.Name || '';
          const stateFound = postOffice.State || '';

          setShippingValue('city', cityFound, { shouldValidate: true });
          setShippingValue('state', stateFound, { shouldValidate: true });

          setPincodeSuccessMsg(`Location found: ${cityFound}, ${stateFound}`);
          setIsFetchingPincode(false);
          return;
        }
      }

      // Fallback API: Zippopotam
      const resZip = await fetch(`https://api.zippopotam.us/in/${cleanCode}`);
      if (resZip.ok) {
        const dataZip = (await resZip.json()) as {
          places?: Array<{
            'place name'?: string;
            state?: string;
          }>;
        };
        if (dataZip.places && dataZip.places.length > 0) {
          const place = dataZip.places[0];
          const cityFound = place['place name'] || '';
          const stateFound = place['state'] || '';

          setShippingValue('city', cityFound, { shouldValidate: true });
          setShippingValue('state', stateFound, { shouldValidate: true });

          setPincodeSuccessMsg(`Location found: ${cityFound}, ${stateFound}`);
          setIsFetchingPincode(false);
          return;
        }
      }

      setPincodeErrorMsg('PIN code location not found. Please type City & State manually.');
    } catch (err) {
      console.error('Pincode fetch error:', err);
      setPincodeErrorMsg(
        'Could not fetch location automatically. Please enter City & State manually.',
      );
    } finally {
      setIsFetchingPincode(false);
    }
  };

  // Razorpay Payment State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');

  // Calculate pricing values
  const shippingCost = cartSubtotal > 4000 || cartSubtotal === 0 ? 0 : 400;
  const taxCost = cartSubtotal * 0.1; // 10% tax
  const totalCost = cartSubtotal + shippingCost + taxCost;

  // Handle Prescription Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const submitOrderToApi = async (paymentDetails: {
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    provider?: string;
  }): Promise<ApiOrderData | null> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const storedCartId =
        typeof window !== 'undefined' ? localStorage.getItem('wellness_cart_id') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (storedCartId) {
        headers['x-cart-id'] = storedCartId;
      }
      if (session?.session.token) {
        headers['Authorization'] = `Bearer ${session.session.token}`;
      }

      const body = {
        shippingAddress: {
          fullName: shippingForm.fullName,
          phone: shippingForm.phone,
          email: shippingForm.email,
          street: shippingForm.address,
          city: shippingForm.city,
          state: shippingForm.state,
          pincode: shippingForm.zipCode,
          country: 'India',
        },
        payment: {
          provider: paymentDetails.provider || 'razorpay',
          transactionId: paymentDetails.transactionId || paymentDetails.razorpayPaymentId,
          razorpayOrderId: paymentDetails.razorpayOrderId,
          razorpayPaymentId: paymentDetails.razorpayPaymentId,
          razorpaySignature: paymentDetails.razorpaySignature,
          amount: totalCost,
          paymentMethod: 'online',
        },
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          unitPrice: item.product.price,
          quantity: item.quantity,
        })),
        subtotal: cartSubtotal,
        shippingAmount: shippingCost,
        taxAmount: taxCost,
        totalAmount: totalCost,
      };

      const res = await fetch(`${backendUrl}/api/orders`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: ApiOrderData;
        };
        if (json.success && json.data) {
          return json.data;
        }
      } else {
        const errJson = (await res.json().catch(() => null)) as {
          message?: string;
          error?: { message?: string };
        } | null;
        const errMsg =
          errJson?.error?.message || errJson?.message || 'Failed to submit order to API.';
        throw new Error(errMsg);
      }
    } catch (e) {
      console.error('Error submitting order to API database:', e);
      throw e;
    }
    return null;
  };

  // Razorpay payment handler
  const handlePayment = async () => {
    if (!session?.user) {
      setPaymentError('Authentication required. Please log in to complete your purchase.');
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    setPaymentError('');
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const payHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session.session.token) {
        payHeaders['Authorization'] = `Bearer ${session.session.token}`;
      }

      const response = await fetch(`${backendUrl}/api/payments/razorpay`, {
        method: 'POST',
        headers: payHeaders,
        body: JSON.stringify({ amount: totalCost }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment with Razorpay. Please try again.');
      }

      const data = (await response.json()) as {
        id?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
      };

      const keyId =
        data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TTtlm8FsLRmEuv';

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK script is still loading. Please try clicking pay again.');
      }

      const options = {
        key: keyId,
        amount: data.amount || Math.round(totalCost * 100),
        currency: data.currency || 'INR',
        name: 'The Wellness Platform',
        description: 'Therapeutic Product Purchase',
        order_id: data.id,
        handler: async function (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) {
          setIsSubmitting(true);
          try {
            const razorpayOrderId = paymentResponse.razorpay_order_id || data.id || '';
            const razorpayPaymentId = paymentResponse.razorpay_payment_id;
            const razorpaySignature = paymentResponse.razorpay_signature || '';

            // Verify payment signature
            if (razorpaySignature) {
              try {
                const verifyHeaders: Record<string, string> = {
                  'Content-Type': 'application/json',
                };
                if (session.session.token) {
                  verifyHeaders['Authorization'] = `Bearer ${session.session.token}`;
                }
                await fetch(`${backendUrl}/api/payments/verify`, {
                  method: 'POST',
                  headers: verifyHeaders,
                  credentials: 'include',
                  body: JSON.stringify({
                    razorpayOrderId,
                    razorpayPaymentId,
                    razorpaySignature,
                  }),
                });
              } catch (vErr) {
                console.warn('Razorpay signature verification warning:', vErr);
              }
            }

            // Save order to API database & deduct stock
            const dbOrder = await submitOrderToApi({
              razorpayPaymentId,
              razorpayOrderId,
              razorpaySignature,
              provider: 'razorpay',
            });

            const finalOrderId = dbOrder?.id || razorpayOrderId || `ORD-${String(Date.now())}`;

            const _orderData: OrderRecord = {
              orderId: finalOrderId,
              paymentId: razorpayPaymentId,
              items: cartItems,
              subtotal: cartSubtotal,
              shipping: shippingCost,
              tax: taxCost,
              total: totalCost,
              shippingForm,
              date: new Date().toISOString(),
              status: 'confirmed',
              hasRxItems,
              rxFileName: hasRxItems ? rxFileName || 'medical_prescription_certified.pdf' : null,
            };

            clearCart();
            const targetUrl = dbOrder?.id ? `/order/success?id=${dbOrder.id}` : '/order/success';
            window.location.href = targetUrl;
          } catch (err) {
            console.error('Razorpay payment handler error:', err);
            setPaymentError('Failed to process completed order. Please contact support.');
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: shippingForm.fullName,
          email: shippingForm.email,
          contact: shippingForm.phone,
        },
        notes: {
          address: `${shippingForm.address}, ${shippingForm.city}${shippingForm.state ? `, ${shippingForm.state}` : ''} - ${shippingForm.zipCode}`,
        },
        theme: {
          color: '#2B7A78',
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (errResponse) {
        console.error('Razorpay payment failed:', errResponse.error);
        const errObj = errResponse.error as { description?: string } | undefined;
        setPaymentError(errObj?.description || 'Payment failed on Razorpay.');
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: unknown) {
      console.error('Payment initialization error:', err);
      const errMsg =
        err instanceof Error ? err.message : 'Payment initialization failed. Please retry.';
      setPaymentError(errMsg);
      setIsSubmitting(false);
    }
  };

  // Step Navigations
  const handleReviewSubmit = () => {
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }
    if (hasRxItems && !rxFile) {
      setRxError('Please upload a valid prescription before proceeding.');
      return;
    }
    setCurrentStep('shipping');
  };

  const saveNewAddressToBackend = async (addr: ShippingForm) => {
    if (!session?.user) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session.session.token) {
        reqHeaders['Authorization'] = `Bearer ${session.session.token}`;
      }
      await fetch(`${backendUrl}/api/customer/addresses`, {
        method: 'POST',
        headers: reqHeaders,
        credentials: 'include',
        body: JSON.stringify({
          fullName: addr.fullName,
          phone: addr.phone,
          street: addr.address,
          city: addr.city,
          state: addr.state,
          pincode: addr.zipCode,
          country: 'India',
        }),
      });
    } catch (e) {
      console.warn('Failed to persist new address to customer DB:', e);
    }
  };

  const onShippingFormSubmit = (data: OrderShippingFormData) => {
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }
    if (isAddingNewAddress || selectedAddressId === 'new') {
      void saveNewAddressToBackend(data);
    }
    setCurrentStep('payment');
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
        <StepIndicator currentStep={currentStep} />

        {/* Auth Required Banner for Unauthenticated Users */}
        {!session?.user && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-wellness-navy">Account Login Required</h4>
                <p className="text-xs text-wellness-charcoal/70">
                  Please log in to your Wellness account before completing checkout and placing an
                  order.
                </p>
              </div>
            </div>
            <Link
              href="/account?redirect=/order"
              className="shrink-0 bg-wellness-navy hover:bg-wellness-green text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
            >
              Sign In / Register
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Step Form Area */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {currentStep === 'review' && (
                <ReviewStep
                  key="review-step"
                  hasRxItems={hasRxItems}
                  rxFileName={rxFileName}
                  rxError={rxError}
                  onFileChange={handleFileChange}
                  onSimulateUpload={triggerSimulatedUpload}
                  onSubmit={handleReviewSubmit}
                />
              )}

              {currentStep === 'shipping' && (
                <ShippingStep
                  key="shipping-step"
                  savedAddresses={savedAddresses}
                  selectedAddressId={selectedAddressId}
                  isAddingNewAddress={isAddingNewAddress}
                  onSelectSavedAddress={handleSelectSavedAddress}
                  onAddNewAddressClick={handleAddNewAddressClick}
                  registerShipping={registerShipping}
                  shippingErrors={shippingErrors}
                  shippingForm={shippingForm}
                  setShippingValue={setShippingValue}
                  isFetchingPincode={isFetchingPincode}
                  pincodeSuccessMsg={pincodeSuccessMsg}
                  pincodeErrorMsg={pincodeErrorMsg}
                  onPincodeFetch={(code) => {
                    void fetchLocationByPincode(code);
                  }}
                  onSubmit={(e) => {
                    void handleShippingSubmit(onShippingFormSubmit)(e);
                  }}
                  onBack={() => {
                    setCurrentStep('review');
                  }}
                  onEditAddress={() => {
                    setIsAddingNewAddress(true);
                  }}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentStep
                  key="payment-step"
                  shippingForm={shippingForm}
                  totalCost={totalCost}
                  paymentError={paymentError}
                  isSubmitting={isSubmitting}
                  onPayment={() => {
                    void handlePayment();
                  }}
                  onBack={() => {
                    setCurrentStep('shipping');
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-5">
            <OrderSummary
              cartItems={cartItems}
              cartSubtotal={cartSubtotal}
              shippingCost={shippingCost}
              taxCost={taxCost}
              totalCost={totalCost}
            />
          </div>
        </div>
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}
