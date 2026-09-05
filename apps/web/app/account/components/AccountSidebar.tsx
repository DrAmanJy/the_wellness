'use client';

import { ShoppingBag, MapPin, User } from 'lucide-react';
import React from 'react';

import type { AccountTab } from '../types';

interface AccountSidebarProps {
  activeTab: AccountTab;
  onSelectTab: (tab: AccountTab) => void;
  ordersCount: number;
  addressesCount: number;
}

export default function AccountSidebar({
  activeTab,
  onSelectTab,
  ordersCount,
  addressesCount,
}: AccountSidebarProps) {
  return (
    <div className="md:col-span-3 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none shrink-0">
      <button
        onClick={() => {
          onSelectTab('orders');
        }}
        className={`flex items-center justify-center md:justify-start gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all border w-full shrink-0 cursor-pointer ${
          activeTab === 'orders'
            ? 'bg-wellness-navy text-white shadow-md border-wellness-navy'
            : 'bg-white/80 border-wellness-gray-200 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-white'
        }`}
      >
        <ShoppingBag size={18} />
        <span>Order History</span>
        {ordersCount > 0 && (
          <span
            className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'orders'
                ? 'bg-wellness-green text-white'
                : 'bg-wellness-gray-100 text-wellness-charcoal/60'
            }`}
          >
            {ordersCount}
          </span>
        )}
      </button>

      <button
        onClick={() => {
          onSelectTab('addresses');
        }}
        className={`flex items-center justify-center md:justify-start gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all border w-full shrink-0 cursor-pointer ${
          activeTab === 'addresses'
            ? 'bg-wellness-navy text-white shadow-md border-wellness-navy'
            : 'bg-white/80 border-wellness-gray-200 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-white'
        }`}
      >
        <MapPin size={18} />
        <span>Addresses</span>
        {addressesCount > 0 && (
          <span
            className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'addresses'
                ? 'bg-wellness-green text-white'
                : 'bg-wellness-gray-100 text-wellness-charcoal/60'
            }`}
          >
            {addressesCount}
          </span>
        )}
      </button>

      <button
        onClick={() => {
          onSelectTab('profile');
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
  );
}
