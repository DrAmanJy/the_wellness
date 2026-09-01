import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import ProductDetailClient from './ProductDetailClient';

import { products } from '@/lib/products';

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.id,
  }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;

  return (
    <div className="pt-12 pb-24 bg-wellness-white min-h-screen">
      <div className="container mx-auto px-6 md:px-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-wellness-charcoal/60 hover:text-wellness-navy transition-colors mb-12 animate-in fade-in slide-in-from-left-4 duration-300"
        >
          <ArrowLeft size={16} />
          Back to all products
        </Link>

        <ProductDetailClient slug={resolvedParams.slug} />
      </div>
    </div>
  );
}
