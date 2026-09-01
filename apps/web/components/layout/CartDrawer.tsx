'use client';

import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Lock, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useEffect } from 'react';

import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
    hasRxItems,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on Esc key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, setCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setCartOpen(false);
            }}
            className="fixed inset-0 bg-black z-[150] cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-white z-[160] shadow-2xl flex flex-col h-full border-l border-wellness-gray-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-wellness-gray-100 flex items-center justify-between bg-wellness-white">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-wellness-navy" size={24} />
                <h2 className="text-xl font-heading font-bold text-wellness-navy">Your Cart</h2>
                <span className="bg-wellness-green/10 text-wellness-green font-semibold text-xs px-2.5 py-1 rounded-full">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={() => {
                  setCartOpen(false);
                }}
                className="text-wellness-charcoal/50 hover:text-wellness-navy p-2 rounded-full hover:bg-wellness-gray-100 transition-colors"
                aria-label="Close Cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Items list */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-wellness-gray-50 flex items-center justify-center mb-6 text-wellness-charcoal/30">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-wellness-navy mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-wellness-charcoal/60 max-w-xs mb-8">
                    Explore our range of premium products and clinical solutions.
                  </p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                    }}
                    className="bg-wellness-navy text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-wellness-green transition-colors cursor-pointer"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  {/* Prescription Notice if Rx items are present */}
                  {hasRxItems && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3">
                      <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                          Prescription Required
                        </h4>
                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                          Your cart contains Prescription (Rx) items. You will need to upload a
                          valid prescription during checkout.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-4 rounded-xl border border-wellness-gray-100 bg-white hover:border-wellness-gray-200 transition-all group"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-20 bg-wellness-gray-50 rounded-lg overflow-hidden shrink-0 border border-wellness-gray-100">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-grow flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-heading font-bold text-wellness-navy text-sm truncate group-hover:text-wellness-green transition-colors">
                                <Link
                                  href={`/products/${item.product.id}`}
                                  onClick={() => {
                                    setCartOpen(false);
                                  }}
                                >
                                  {item.product.name}
                                </Link>
                              </h4>
                              <button
                                onClick={() => {
                                  removeFromCart(item.product.id);
                                }}
                                className="text-wellness-charcoal/40 hover:text-red-500 transition-colors p-1"
                                aria-label="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-wellness-navy bg-wellness-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                {item.product.type}
                              </span>
                              <span className="text-[10px] font-semibold text-wellness-charcoal/50">
                                {item.product.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-wellness-gray-200 rounded bg-wellness-white">
                              <button
                                onClick={() => {
                                  updateQuantity(item.product.id, item.quantity - 1);
                                }}
                                className="px-2 py-1 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-wellness-gray-100 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-3 text-xs font-bold text-wellness-navy min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  updateQuantity(item.product.id, item.quantity + 1);
                                }}
                                className="px-2 py-1 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-wellness-gray-100 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Price */}
                            <p className="text-sm font-bold text-wellness-navy">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-wellness-gray-100 bg-wellness-white">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-wellness-charcoal/70 font-semibold">
                    <span>Subtotal</span>
                    <span className="text-wellness-navy">₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-wellness-charcoal/50 font-medium">
                    <span>Shipping & taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="pt-2 border-t border-wellness-gray-200 flex justify-between font-heading font-bold text-base text-wellness-navy">
                    <span>Estimated Total</span>
                    <span>₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/order"
                    onClick={() => {
                      setCartOpen(false);
                    }}
                    className="w-full bg-wellness-green hover:bg-wellness-navy text-white py-4 px-6 rounded-md font-semibold flex items-center justify-center gap-2 transition-all shadow-md group"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-wellness-charcoal/40 font-bold uppercase tracking-wider">
                    <Lock size={12} />
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
