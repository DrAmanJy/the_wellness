'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function SpecialPromoBanner() {
  const [bannerImage, setBannerImage] = useState('/images/default-promo-banner.png');
  const [bannerLink, setBannerLink] = useState('/products');

  useEffect(() => {
    let isMounted = true;
    async function fetchBanner() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/promotions?active=true`);
        if (res.ok) {
          const result = (await res.json()) as {
            success?: boolean;
            data?: Array<{ imageUrl?: string; targetUrl?: string }>;
          };
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            const banner = result.data[0];
            if (isMounted && banner.imageUrl) {
              setBannerImage(banner.imageUrl);
              setBannerLink(banner.targetUrl || '/products');
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch promotional banner:', err);
      }
    }
    void fetchBanner();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-4 md:py-8 bg-white relative overflow-hidden w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full"
      >
        <Link href={bannerLink} className="block w-full">
          <div className="group relative w-full h-[180px] sm:h-[260px] md:h-[340px] lg:h-[420px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer">
            {/* Overlay shadow for aesthetic glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

            <Image
              src={bannerImage}
              alt="Special Advertisement Banner"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              priority
              sizes="100vw"
              unoptimized={bannerImage.startsWith('data:')}
            />
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
