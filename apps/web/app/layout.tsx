import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import ReduxProvider from '@/components/providers/ReduxProvider';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'The Wellness | Better Health. Backed by Science.',
  description:
    'Premium healthcare and wellness products backed by scientific research and quality manufacturing.',
  openGraph: {
    title: 'The Wellness | Better Health. Backed by Science.',
    description:
      'Premium healthcare and wellness products backed by scientific research and quality manufacturing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Wellness',
    description: 'Better Health. Backed by Science.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body
        className="bg-wellness-white text-wellness-charcoal antialiased flex flex-col min-h-screen"
        suppressHydrationWarning
      >
        <AppRouterCacheProvider>
          <ReduxProvider>
            <CartProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </CartProvider>
          </ReduxProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
