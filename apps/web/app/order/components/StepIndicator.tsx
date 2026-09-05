'use client';

import React from 'react';

import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
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
  );
}
