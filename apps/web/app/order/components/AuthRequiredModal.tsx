'use client';

import { ArrowRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import React from 'react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthRequiredModal({ isOpen, onClose }: AuthRequiredModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-wellness-gray-200 text-center space-y-6 relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-wellness-green/10 text-wellness-green rounded-full flex items-center justify-center mx-auto border border-wellness-green/20">
              <Lock size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-heading font-extrabold text-wellness-navy">
                Account Login Required
              </h3>
              <p className="text-xs text-wellness-charcoal/70 leading-relaxed">
                To ensure order security and medicinal compliance, please log in or create a
                Wellness account before completing checkout and placing your order.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <Link
                href="/account?redirect=/order"
                className="w-full inline-flex justify-center items-center gap-2 bg-wellness-navy hover:bg-wellness-green text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm"
              >
                <span>Log In / Register</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-xs font-bold text-wellness-charcoal/50 hover:text-wellness-navy py-2 transition-colors cursor-pointer"
              >
                Cancel & Return to Order Review
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
