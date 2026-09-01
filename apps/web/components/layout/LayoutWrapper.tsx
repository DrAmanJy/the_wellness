'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

import CartDrawer from './CartDrawer';
import Footer from './Footer';
import Navbar from './Navbar';
import PageLoader from './PageLoader';
import WishlistDrawer from './WishlistDrawer';

import { authClient } from '@/lib/auth-client';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const { data: session } = authClient.useSession();
  const isLoginPage = pathname === '/account' && !session;

  if (isAdmin || isLoginPage) {
    return (
      <>
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        <main className="flex-grow">{children}</main>
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <PageLoader />
      </Suspense>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main className="flex-grow pt-[var(--header-height,148px)] transition-[padding-top] duration-300 ease-in-out">
        {children}
      </main>
      <CartDrawer />
      <WishlistDrawer />
      <Footer />
    </>
  );
}
