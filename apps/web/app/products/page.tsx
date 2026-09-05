import React, { Suspense } from 'react';

import ProductsClient from './ProductsClient';

export const metadata = {
  title: 'Our Products | The Wellness',
  description: 'Explore our premium healthcare and pharmaceutical products.',
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-6 md:px-12 py-20 text-center text-wellness-navy font-semibold">
          Loading product catalog...
        </div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
