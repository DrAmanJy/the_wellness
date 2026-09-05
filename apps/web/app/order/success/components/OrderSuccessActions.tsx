'use client';

import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function OrderSuccessActions() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
      <Link
        href="/products"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-wellness-navy text-white px-9 py-4 rounded-2xl font-extrabold transition-all shadow-lg hover:shadow-emerald-600/20 text-sm cursor-pointer"
      >
        <span>Continue Shopping Catalog</span>
        <ArrowRight size={18} />
      </Link>
      <Link
        href="/account"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-200 hover:bg-white text-slate-700 px-7 py-4 rounded-2xl font-bold transition-all text-xs cursor-pointer shadow-xs"
      >
        <FileText size={16} />
        <span>Go to My Account Orders</span>
      </Link>
    </div>
  );
}
