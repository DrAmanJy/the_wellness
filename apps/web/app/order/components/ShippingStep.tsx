'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Loader2,
  Search,
  Plus,
  Check,
  Edit2,
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';

import { OrderShippingFormData, SavedAddress } from '../types';

interface ShippingStepProps {
  savedAddresses: SavedAddress[];
  selectedAddressId: string;
  isAddingNewAddress: boolean;
  onSelectSavedAddress: (addr: SavedAddress) => void;
  onAddNewAddressClick: () => void;
  registerShipping: UseFormRegister<OrderShippingFormData>;
  shippingErrors: FieldErrors<OrderShippingFormData>;
  shippingForm: OrderShippingFormData;
  setShippingValue: UseFormSetValue<OrderShippingFormData>;
  isFetchingPincode: boolean;
  pincodeSuccessMsg: string;
  pincodeErrorMsg: string;
  onPincodeFetch: (code: string) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onBack: () => void;
  onEditAddress: () => void;
}

export default function ShippingStep({
  savedAddresses,
  selectedAddressId,
  isAddingNewAddress,
  onSelectSavedAddress,
  onAddNewAddressClick,
  registerShipping,
  shippingErrors,
  shippingForm,
  setShippingValue,
  isFetchingPincode,
  pincodeSuccessMsg,
  pincodeErrorMsg,
  onPincodeFetch,
  onSubmit,
  onBack,
  onEditAddress,
}: ShippingStepProps) {
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
          Shipping Information
        </h2>
        <p className="text-wellness-charcoal/70 font-medium text-sm">
          Choose a saved address or enter a new delivery location.
        </p>
      </div>

      {/* Saved Shipping Addresses Selection Section */}
      <div className="bg-white border border-wellness-gray-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-wellness-green shrink-0" />
            <h3 className="text-sm font-bold text-wellness-navy uppercase tracking-wider">
              Select Delivery Address
            </h3>
          </div>
          <button
            type="button"
            onClick={onAddNewAddressClick}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isAddingNewAddress || selectedAddressId === 'new'
                ? 'bg-wellness-green text-white shadow-sm'
                : 'bg-wellness-gray-100 text-wellness-navy hover:bg-wellness-gray-200'
            }`}
          >
            <Plus size={14} />
            <span>+ Add New Address</span>
          </button>
        </div>

        {savedAddresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id && !isAddingNewAddress;
              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    onSelectSavedAddress(addr);
                  }}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-wellness-green bg-emerald-50/50 ring-2 ring-wellness-green/30 shadow-md'
                      : 'border-wellness-gray-200 bg-white hover:border-wellness-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-wellness-green bg-wellness-green text-white'
                              : 'border-wellness-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className="font-bold text-sm text-wellness-navy">
                          {addr.fullName}
                        </span>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] uppercase font-extrabold bg-wellness-navy text-white px-2.5 py-0.5 rounded-full tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-wellness-charcoal/80 font-medium leading-relaxed mb-3">
                      {addr.address}, {addr.city}, {addr.state} -{' '}
                      <span className="font-mono font-bold text-wellness-navy">{addr.zipCode}</span>
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-wellness-gray-100 flex items-center justify-between text-[11px] text-wellness-charcoal/60 font-semibold">
                    <span>Phone: {addr.phone || 'N/A'}</span>
                    {isSelected ? (
                      <span className="text-wellness-green font-extrabold flex items-center gap-1">
                        Selected <Check size={12} />
                      </span>
                    ) : (
                      <span className="text-wellness-navy font-bold hover:underline">
                        Use Address
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add New Address Card Option */}
            <div
              onClick={onAddNewAddressClick}
              className={`cursor-pointer rounded-2xl p-5 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[120px] ${
                isAddingNewAddress || selectedAddressId === 'new'
                  ? 'border-wellness-green bg-emerald-50/40 ring-2 ring-wellness-green/30'
                  : 'border-wellness-gray-300 bg-wellness-gray-50/50 hover:bg-wellness-gray-100/80'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-wellness-green/10 text-wellness-green flex items-center justify-center">
                <Plus size={18} />
              </div>
              <span className="font-bold text-xs text-wellness-navy">+ Add New Address</span>
              <span className="text-[10px] text-wellness-charcoal/50 font-medium">
                Deliver to a new location
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-wellness-gray-50 border border-wellness-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-wellness-navy/10 text-wellness-navy flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-wellness-navy">No saved addresses found</p>
                <p className="text-[11px] text-wellness-charcoal/60 font-medium">
                  Enter your address below. It will automatically be saved for future orders.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {isAddingNewAddress || selectedAddressId === 'new' || savedAddresses.length === 0 ? (
          <div className="bg-white border border-wellness-gray-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            {/* 1. Contact Details */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...registerShipping('fullName')}
                    className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                      shippingErrors.fullName ? 'border-red-400' : 'border-wellness-gray-200'
                    }`}
                    placeholder="John Doe"
                  />
                  {shippingErrors.fullName && (
                    <p className="text-[10px] text-red-500 font-semibold">
                      {shippingErrors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...registerShipping('email')}
                    className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                      shippingErrors.email ? 'border-red-400' : 'border-wellness-gray-200'
                    }`}
                    placeholder="john@example.com"
                  />
                  {shippingErrors.email && (
                    <p className="text-[10px] text-red-500 font-semibold">
                      {shippingErrors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...registerShipping('phone')}
                  className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                    shippingErrors.phone ? 'border-red-400' : 'border-wellness-gray-200'
                  }`}
                  placeholder="+91 98765 43210"
                />
                {shippingErrors.phone && (
                  <p className="text-[10px] text-red-500 font-semibold">
                    {shippingErrors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Location */}
            <div className="bg-wellness-gray-50/80 p-5 rounded-2xl border border-wellness-gray-200 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-wellness-green" />
                    <span>PIN Code / ZIP Code *</span>
                  </label>
                  <span className="text-[10px] text-wellness-charcoal/50 font-semibold hidden sm:inline">
                    Enter 6 digits to auto-fill location
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    {...registerShipping('zipCode', {
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setShippingValue('zipCode', val, { shouldValidate: true });
                        if (val.length === 6) {
                          onPincodeFetch(val);
                        }
                      },
                    })}
                    className={`w-full px-4 py-3.5 pr-28 rounded-xl border bg-white font-mono text-sm font-bold tracking-widest text-wellness-navy focus:outline-none focus:border-wellness-green transition-all ${
                      shippingErrors.zipCode ? 'border-red-400' : 'border-wellness-gray-200'
                    }`}
                    placeholder="e.g. 110001"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onPincodeFetch(shippingForm.zipCode || '');
                      }}
                      disabled={isFetchingPincode || (shippingForm.zipCode || '').length !== 6}
                      className="px-3.5 py-2 bg-wellness-navy hover:bg-wellness-green disabled:bg-wellness-gray-200 text-white disabled:text-wellness-charcoal/40 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isFetchingPincode ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <Search size={13} />
                          <span>Lookup</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {shippingErrors.zipCode && (
                  <p className="text-[10px] text-red-500 font-semibold">
                    {shippingErrors.zipCode.message}
                  </p>
                )}

                {pincodeSuccessMsg && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-semibold">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{pincodeSuccessMsg}</span>
                  </div>
                )}

                {pincodeErrorMsg && (
                  <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl font-medium">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <span>{pincodeErrorMsg}</span>
                  </div>
                )}
              </div>

              {/* State & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                    State *
                  </label>
                  <input
                    type="text"
                    {...registerShipping('state')}
                    className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:border-wellness-green transition-all ${
                      shippingErrors.state ? 'border-red-400' : 'border-wellness-gray-200'
                    }`}
                    placeholder="e.g. Delhi"
                  />
                  {shippingErrors.state && (
                    <p className="text-[10px] text-red-500 font-semibold">
                      {shippingErrors.state.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                    City / District *
                  </label>
                  <input
                    type="text"
                    {...registerShipping('city')}
                    className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:border-wellness-green transition-all ${
                      shippingErrors.city ? 'border-red-400' : 'border-wellness-gray-200'
                    }`}
                    placeholder="e.g. New Delhi"
                  />
                  {shippingErrors.city && (
                    <p className="text-[10px] text-red-500 font-semibold">
                      {shippingErrors.city.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Street Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                Street Address *
              </label>
              <input
                type="text"
                {...registerShipping('address')}
                className={`w-full px-4 py-3 rounded-lg border bg-wellness-white focus:outline-none focus:border-wellness-green transition-all ${
                  shippingErrors.address ? 'border-red-400' : 'border-wellness-gray-200'
                }`}
                placeholder="House / Flat No., Street Name, Area, Landmark"
              />
              {shippingErrors.address && (
                <p className="text-[10px] text-red-500 font-semibold">
                  {shippingErrors.address.message}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-wellness-green/30 bg-emerald-50/20 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-wellness-navy text-base">
                  {shippingForm.fullName}
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check size={12} /> Selected for Delivery
                </span>
              </div>
              <p className="text-sm text-wellness-charcoal/80">
                {shippingForm.address}, {shippingForm.city}, {shippingForm.state} -{' '}
                <span className="font-mono font-bold text-wellness-navy">
                  {shippingForm.zipCode}
                </span>
              </p>
              <p className="text-xs text-wellness-charcoal/60">
                Phone: <span className="font-medium text-wellness-navy">{shippingForm.phone}</span>{' '}
                | Email:{' '}
                <span className="font-medium text-wellness-navy">{shippingForm.email}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onEditAddress}
              className="px-4 py-2 border border-wellness-navy/20 hover:border-wellness-navy text-wellness-navy text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <Edit2 size={13} />
              <span>Edit Address Details</span>
            </button>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={onBack}
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
  );
}
