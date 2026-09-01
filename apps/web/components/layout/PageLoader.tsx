'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start progress animation
  const startLoading = () => {
    setVisible(true);
    setProgress(15);

    // Stop any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Trickle progress up to 85%
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 85;
        }
        // Random small increments
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 150);
  };

  // Complete loading animation
  const stopLoading = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 300);
  };

  // Detect route change completion
  useEffect(() => {
    stopLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      // Only handle relative internal links that do not open in new tab
      if (href && href.startsWith('/') && !href.startsWith('//') && targetAttr !== '_blank') {
        // Resolve absolute path parts to avoid trigger on hash links or same-page navigation
        const currentPath = window.location.pathname;
        const targetPath = href.split('?')[0].split('#')[0];

        // Skip if navigating to the same URL or a hash/anchor
        if (currentPath === targetPath || href.startsWith('#')) {
          return;
        }

        // Start progress indicator
        startLoading();
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => {
      document.removeEventListener('click', handleLinkClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="h-[3px] bg-wellness-green shadow-[0_0_8px_#10B981,0_0_4px_#10B981] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
