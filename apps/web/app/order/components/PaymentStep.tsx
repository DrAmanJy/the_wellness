'use client';

import { ArrowLeft, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Script from 'next/script';
import React from 'react';

import { OrderShippingFormData } from '../types';

interface PaymentStepProps {
  shippingForm: OrderShippingFormData;
  totalCost: number;
  paymentError: string;
  isSubmitting: boolean;
  onPayment: () => void;
  onBack: () => void;
}

export default function PaymentStep({
  shippingForm,
  totalCost,
  paymentError,
  isSubmitting,
  onPayment,
  onBack,
}: PaymentStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div>
        <h2 className="text-3xl font-heading font-bold text-wellness-navy mb-2">Secure Checkout</h2>
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
              <p className="text-sm font-bold text-wellness-navy">{shippingForm.fullName}</p>
              <p className="text-xs text-wellness-charcoal/70 mt-1 font-medium">
                {shippingForm.phone}
              </p>
              <p className="text-xs text-wellness-charcoal/70 font-medium">{shippingForm.email}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-wellness-charcoal/40 uppercase tracking-widest mb-2">
                Shipping Destination
              </h4>
              <p className="text-xs text-wellness-charcoal/70 font-medium leading-relaxed font-sans">
                {shippingForm.address},<br />
                {shippingForm.city}
                {shippingForm.state ? `, ${shippingForm.state}` : ''} - {shippingForm.zipCode}
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
            onClick={onPayment}
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
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-wellness-charcoal/60 hover:text-wellness-navy transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Shipping
          </button>
        </div>
      </div>
    </motion.div>
  );
}
