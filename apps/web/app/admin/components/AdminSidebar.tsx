'use client';

import {
  Sparkles,
  TrendingUp,
  Activity,
  Package,
  Layers,
  MessageSquare,
  ShoppingBag,
  Percent,
  LogOut,
} from 'lucide-react';
import React from 'react';

import { AdminTab } from '../types';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  queriesCount: number;
  ordersCount: number;
  adminEmail?: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  queriesCount,
  ordersCount,
  adminEmail,
  mobileOpen,
  onCloseMobile,
  onSignOut,
}: AdminSidebarProps) {
  const tabs = [
    { id: 'analytics' as const, label: 'Analytics Dashboard', icon: <TrendingUp size={15} /> },
    { id: 'products' as const, label: 'Products Catalog', icon: <Activity size={15} /> },
    { id: 'inventory' as const, label: 'Inventory Control', icon: <Package size={15} /> },
    { id: 'categories' as const, label: 'Categories Management', icon: <Layers size={15} /> },
    {
      id: 'queries' as const,
      label: 'Customer Inquiries',
      badge: queriesCount > 0 ? String(queriesCount) : null,
      icon: <MessageSquare size={15} />,
    },
    {
      id: 'orders' as const,
      label: 'Orders Control',
      badge: ordersCount > 0 ? String(ordersCount) : null,
      icon: <ShoppingBag size={15} />,
    },
    { id: 'promotions' as const, label: 'Promotions & Banners', icon: <Percent size={15} /> },
  ];

  return (
    <aside
      className={`w-64 bg-wellness-navy text-white flex flex-col fixed inset-y-0 left-0 z-40 border-r border-white/10 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3 mt-16 lg:mt-0">
        <div className="w-10 h-10 rounded-xl bg-wellness-green text-wellness-navy flex items-center justify-center font-black shadow-lg shadow-wellness-green/20 group cursor-pointer">
          <Sparkles size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-sm font-heading font-black tracking-tight text-white leading-none">
            The Wellness<span className="text-wellness-green">.</span>
          </h2>
          <p className="text-[9px] text-wellness-light-green/90 font-extrabold uppercase tracking-widest mt-1.5 bg-wellness-light-green/10 px-2 py-0.5 rounded border border-wellness-light-green/20 inline-block">
            Clinical Control Center
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-wellness-green text-wellness-navy shadow-md shadow-wellness-green/20 font-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-wellness-navy/20 text-wellness-navy'
                      : 'bg-wellness-light-green/20 text-wellness-light-green border border-wellness-light-green/20'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile brief & Footer controls */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-wellness-green/20 text-wellness-light-green flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-wellness-green/30">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold text-white truncate">Administrator</p>
            <p className="text-[8px] text-white/50 truncate font-mono">
              {adminEmail || 'admin@thewellness.com'}
            </p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-1.5 text-red-300 hover:text-white bg-red-500/15 hover:bg-red-600 py-2.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border border-red-500/20"
        >
          <LogOut size={12} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
