'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, MapPin, Check, Trash2, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { type Address, type AccountAddressFormData, accountAddressSchema } from '../../types';

interface AddressesTabProps {
  addresses: Address[];
  onAddAddress: (data: AccountAddressFormData) => Promise<void>;
  onSetDefaultAddress: (id: string) => void;
  onDeleteAddress: (id: string) => Promise<void>;
}

export default function AddressesTab({
  addresses,
  onAddAddress,
  onSetDefaultAddress,
  onDeleteAddress,
}: AddressesTabProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    formState: { errors: addressFormErrors },
  } = useForm<AccountAddressFormData>({
    resolver: zodResolver(accountAddressSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
    },
  });

  const onSubmit = async (data: AccountAddressFormData) => {
    await onAddAddress(data);
    resetAddressForm();
    setShowAddressForm(false);
  };

  return (
    <motion.div
      key="addresses-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-extrabold text-wellness-navy">Saved Addresses</h3>
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
          <form
            onSubmit={(e) => {
              void handleAddressSubmit(onSubmit)(e);
            }}
            className="space-y-4 text-xs"
          >
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
                  {...registerAddress('fullName')}
                  placeholder="Jane Doe"
                  className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                />
                {addressFormErrors.fullName && (
                  <p className="text-[10px] text-red-500 font-semibold">
                    {addressFormErrors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-wellness-charcoal/50 uppercase tracking-wide">
                  Phone Number
                </label>
                <input
                  type="text"
                  {...registerAddress('phone')}
                  placeholder="9988776655"
                  className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                />
                {addressFormErrors.phone && (
                  <p className="text-[10px] text-red-500 font-semibold">
                    {addressFormErrors.phone.message}
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
                {...registerAddress('email')}
                placeholder="jane@example.com"
                className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
              />
              {addressFormErrors.email && (
                <p className="text-[10px] text-red-500 font-semibold">
                  {addressFormErrors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-wellness-charcoal/50 uppercase tracking-wide">
                Street Address
              </label>
              <input
                type="text"
                {...registerAddress('address')}
                placeholder="Flat/House No, Building, Street Name"
                className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
              />
              {addressFormErrors.address && (
                <p className="text-[10px] text-red-500 font-semibold">
                  {addressFormErrors.address.message}
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
                  {...registerAddress('city')}
                  placeholder="Mumbai"
                  className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                />
                {addressFormErrors.city && (
                  <p className="text-[10px] text-red-500 font-semibold">
                    {addressFormErrors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-wellness-charcoal/50 uppercase tracking-wide">
                  ZIP Code
                </label>
                <input
                  type="text"
                  {...registerAddress('zipCode')}
                  placeholder="400001"
                  className="w-full bg-wellness-gray-50 border border-wellness-gray-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-wellness-green transition-colors text-sm font-medium"
                />
                {addressFormErrors.zipCode && (
                  <p className="text-[10px] text-red-500 font-semibold">
                    {addressFormErrors.zipCode.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetAddressForm();
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
            <h3 className="text-base font-bold text-wellness-navy">No Addresses Saved Yet</h3>
            <p className="text-xs text-wellness-charcoal/60 leading-relaxed">
              Your delivery addresses will automatically save here upon order completion, or you can
              add them manually.
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
                    <h4 className="text-sm font-bold text-wellness-navy">{addr.fullName}</h4>
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
                    void onDeleteAddress(addr.id);
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
                      onSetDefaultAddress(addr.id);
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
  );
}
