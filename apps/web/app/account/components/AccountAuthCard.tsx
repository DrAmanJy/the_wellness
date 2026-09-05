'use client';

import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface AccountAuthCardProps {
  authError: string;
  isSubmittingAuth: boolean;
  onOAuthSignIn: (provider: 'google') => Promise<void>;
}

export default function AccountAuthCard({
  authError,
  isSubmittingAuth,
  onOAuthSignIn,
}: AccountAuthCardProps) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white text-wellness-charcoal font-sans">
      {/* Left column: Split screen Content & Image (takes 5 cols on lg) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-wellness-navy via-[#0C1B33] to-wellness-navy text-white flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-wellness-green/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-wellness-light-green/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative w-full aspect-square my-auto max-w-sm mx-auto overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center p-6 shadow-2xl">
          <Image
            src="/images/login_brand_visual.png"
            alt="Boutique Clinical Serum Formulation"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-heading font-black tracking-tight uppercase text-white">
            Boutique Formulation.
          </h3>
          <p className="text-xs text-wellness-light-green/70 leading-relaxed font-bold">
            The Wellness bridges advanced diagnostic parameters with boutique atelier manufacturing
            standards. Sign in to review your personalised clinical logs and formulations.
          </p>
        </div>

        <div className="relative z-10 text-[9px] text-white/30 font-bold tracking-widest uppercase border-t border-white/10 pt-6">
          © {new Date().getFullYear().toString()} The Wellness Pvt Ltd. All rights reserved.
        </div>
      </div>

      {/* Right column: Login Card (takes 7 cols on lg) */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 relative bg-white min-h-screen">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-wellness-charcoal/60 hover:text-wellness-green transition-all group"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-1 stroke-[2]"
          />
          <span>Back to Home</span>
        </Link>

        {/* Brand Logo & Name */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <Link
            href="/"
            className="text-2xl font-heading font-black tracking-tight flex items-center gap-2.5 group/logo"
          >
            <div className="w-9 h-9 rounded-bl-xl rounded-tr-xl bg-wellness-green flex items-center justify-center transition-all duration-500 group-hover/logo:rotate-180 shadow-md shadow-wellness-green/10">
              <div className="w-3.5 h-3.5 rounded-full bg-white transition-colors duration-500"></div>
            </div>
            <span className="text-wellness-navy font-heading font-black">
              The Wellness<span className="text-wellness-green font-medium">.</span>
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white border border-wellness-gray-200/80 p-8 sm:p-10 rounded-3xl shadow-xl shadow-wellness-navy/5 space-y-8"
          >
            {/* Card Header */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-heading font-black tracking-tight text-wellness-navy">
                Welcome Back
              </h2>
              <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-semibold max-w-[320px] mx-auto">
                Sign in to view your orders, track diagnostics, and manage prescriptions.
              </p>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-700 leading-normal font-semibold flex items-center gap-2 shadow-sm"
              >
                <span className="text-base shrink-0">⚠️</span>
                <span>{authError}</span>
              </motion.div>
            )}

            {/* OAuth buttons */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  void onOAuthSignIn('google');
                }}
                disabled={isSubmittingAuth}
                className="w-full flex items-center justify-center gap-3 border border-wellness-gray-200 bg-white hover:bg-wellness-navy hover:text-white hover:border-wellness-navy px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-wellness-navy cursor-pointer transition-all duration-300 hover:shadow-md disabled:opacity-50 group shadow-sm active:scale-[0.98]"
              >
                {isSubmittingAuth ? (
                  <div className="w-4 h-4 border-2 border-wellness-navy/20 border-t-wellness-navy group-hover:border-white/20 group-hover:border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Authenticate with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Secure Patient Protocols */}
            <div className="space-y-3 pt-6 border-t border-wellness-gray-100/80">
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-center gap-2.5 text-[11px] text-wellness-charcoal/60 font-semibold">
                  <ShieldCheck size={14} className="text-wellness-green shrink-0" />
                  <span>Secure HIPAA-aligned data systems</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-wellness-charcoal/60 font-semibold">
                  <Lock size={14} className="text-wellness-green shrink-0" />
                  <span>Encrypted single sign-on access</span>
                </div>
              </div>
            </div>

            {/* Secure authentication note */}
            <div className="pt-2 text-center">
              <p className="text-[9px] text-wellness-charcoal/40 font-bold leading-relaxed">
                Having trouble? Contact support at{' '}
                <span className="text-wellness-navy font-extrabold">support@thewellness.com</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
