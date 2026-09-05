'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import type { Product } from '@/lib/products';

interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    setActiveImgIndex(0);
  }, [product]);

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = imagesList[activeImgIndex] || product.image;

  // Calculate lens dimensions & clamped positions
  const LENS_SIZE = 30; // 30% of container size
  const halfLens = LENS_SIZE / 2;
  const minPos = halfLens;
  const maxPos = 100 - halfLens;

  const lensX = Math.min(maxPos, Math.max(minPos, zoomPos.x));
  const lensY = Math.min(maxPos, Math.max(minPos, zoomPos.y));

  // Map clamped positions [minPos, maxPos] linearly to [0, 100] for backgroundPosition
  const bgX = ((lensX - minPos) / (maxPos - minPos)) * 100;
  const bgY = ((lensY - minPos) / (maxPos - minPos)) * 100;
  const bgSize = `${String((100 / LENS_SIZE) * 100)}%`;

  return (
    <div className="space-y-4 relative">
      {/* Main Active Image Container */}
      <div className="product-image relative aspect-[4/3] lg:aspect-square rounded-2xl bg-wellness-gray-100 shadow-xl border border-wellness-gray-200 select-none z-40">
        {/* Clipped image area */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
          <Image
            src={currentImage}
            alt={product.name}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            priority
          />

          {/* Lens selector overlay */}
          {showZoom && (
            <div
              className="absolute border border-wellness-navy/35 bg-wellness-navy/10 rounded-lg pointer-events-none hidden md:block"
              style={{
                width: `${String(LENS_SIZE)}%`,
                height: `${String(LENS_SIZE)}%`,
                left: `${String(lensX)}%`,
                top: `${String(lensY)}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </div>

        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-wellness-navy shadow-sm uppercase tracking-widest border border-wellness-gray-200 pointer-events-none select-none z-20">
          {product.type}
        </div>

        {/* Side Magnifier Zoom Portal (Desktop only) */}
        {showZoom && (
          <div className="absolute left-[104%] top-0 w-full h-full bg-white border border-wellness-gray-200 rounded-2xl overflow-hidden shadow-2xl z-[60] hidden md:block pointer-events-none">
            <div
              className="w-full h-full origin-center"
              style={{
                backgroundImage: `url('${currentImage}')`,
                backgroundPosition: `${String(bgX)}% ${String(bgY)}%`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${bgSize} ${bgSize}`,
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        )}

        {/* Invisible Hover Capture Overlay */}
        <div
          className="absolute inset-0 z-50 cursor-crosshair rounded-2xl"
          onMouseEnter={() => {
            setShowZoom(true);
          }}
          onMouseLeave={() => {
            setShowZoom(false);
            setZoomPos({ x: 0, y: 0 });
          }}
          onMouseMove={(e) => {
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const x = Math.min(100, Math.max(0, ((e.clientX - left) / width) * 100));
            const y = Math.min(100, Math.max(0, ((e.clientY - top) / height) * 100));
            setZoomPos({ x, y });
          }}
        />
      </div>

      {/* Thumbnails Row */}
      {imagesList.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-1">
          {imagesList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveImgIndex(idx);
              }}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 bg-wellness-gray-50 focus:outline-none transition-all flex-shrink-0 cursor-pointer ${
                activeImgIndex === idx
                  ? 'border-wellness-navy scale-[1.03] shadow-md'
                  : 'border-wellness-gray-200 hover:border-wellness-navy/50'
              }`}
            >
              <Image
                src={img}
                alt={`${product.name} gallery image ${String(idx + 1)}`}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
