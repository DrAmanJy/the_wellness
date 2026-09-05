'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

interface ReviewStepProps {
  hasRxItems: boolean;
  rxFileName: string;
  rxError: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSimulateUpload: () => void;
  onSubmit: () => void;
}

export default function ReviewStep({
  hasRxItems,
  rxFileName,
  rxError,
  onFileChange,
  onSimulateUpload,
  onSubmit,
}: ReviewStepProps) {
  return (
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
                Your order contains regulated prescription drugs. Please upload a scanned copy of
                your doctor&apos;s official prescription (PDF, JPEG, or PNG) to continue.
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-wellness-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center hover:border-wellness-green transition-colors relative bg-wellness-gray-50/50">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={onFileChange}
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
              onClick={onSimulateUpload}
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
            <h3 className="font-heading font-bold text-wellness-navy text-sm">OTC Items Only</h3>
            <p className="text-xs text-wellness-charcoal/60 leading-relaxed mt-0.5">
              Your cart only contains Over-The-Counter wellness products. No medical prescription is
              required.
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
          onClick={onSubmit}
          className="bg-wellness-green hover:bg-wellness-navy text-white px-8 py-4 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
        >
          <span>Shipping Address</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
