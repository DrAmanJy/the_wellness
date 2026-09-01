'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function SpecialPromoBanner() {
  const [bannerImage, setBannerImage] = useState('/images/default-promo-banner.png');
  const [bannerLink, setBannerLink] = useState('/products');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const savedImage = localStorage.getItem('admin_promo_banner_image');
      if (savedImage) {
        setBannerImage(savedImage);
      }
      const savedLink = localStorage.getItem('admin_promo_banner_link');
      if (savedLink) {
        setBannerLink(savedLink);
      }
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="py-12 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="w-full aspect-[21/9] md:aspect-[3/1] rounded-[32px] bg-wellness-navy/5 animate-pulse border border-wellness-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      {/* Background patterns for a refined container outline */}
      <div className="absolute inset-0 bg-[radial-gradient(#2b7a78_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full"
        >
          <Link href={bannerLink}>
            <div className="group relative w-full aspect-[1/1] sm:aspect-[21/9] rounded-[32px] overflow-hidden shadow-2xl border border-wellness-navy/10 hover:shadow-wellness-green/10 hover:border-wellness-green/30 transition-all duration-500 cursor-pointer">
              {/* Overlay shadow for aesthetic glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

              <Image
                src={bannerImage}
                alt="Special Advertisement Banner"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
