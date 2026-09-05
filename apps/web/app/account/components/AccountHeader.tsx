'use client';

import { User, Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface AccountHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
  onSignOut: () => Promise<void>;
}

export default function AccountHeader({ user, onSignOut }: AccountHeaderProps) {
  const isAdmin = user.role === 'admin' || user.email === 'admin@thewellness.com';

  return (
    <div className="relative bg-white/80 border border-wellness-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl glass-premium overflow-hidden">
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-wellness-green/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-wellness-light-green/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
        <div className="relative w-20 h-20 bg-wellness-green/10 border border-wellness-green/20 text-wellness-green rounded-full flex items-center justify-center shadow-inner overflow-hidden">
          {user.image ? (
            <Image src={user.image} alt={user.name} fill className="object-cover" />
          ) : (
            <User size={36} className="stroke-[1.5]" />
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-heading font-extrabold text-wellness-navy">
              Hello, {user.name}
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-wellness-green tracking-widest bg-wellness-green/10 px-2.5 py-0.5 rounded-full">
              <Sparkles size={8} />
              <span>Explorer Tier</span>
            </span>
          </div>
          <p className="text-sm text-wellness-charcoal/60">
            Logged in as <span className="font-semibold text-wellness-navy">{user.email}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 z-10">
        {isAdmin && (
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
            void onSignOut();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-wellness-navy hover:text-wellness-green bg-wellness-gray-100 hover:bg-wellness-gray-200 px-3.5 py-2 rounded-xl transition-all border border-wellness-gray-200 cursor-pointer"
        >
          <LogOut size={12} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
