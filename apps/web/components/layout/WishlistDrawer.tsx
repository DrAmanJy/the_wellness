'use client';

import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useEffect } from 'react';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistDrawer() {
  const { wishlistItems, isWishlistOpen, setWishlistOpen, removeFromWishlist, wishlistCount } =
    useWishlist();

  const { addToCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on Esc key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWishlistOpen(false);
    };
    if (isWishlistOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isWishlistOpen, setWishlistOpen]);

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setWishlistOpen(false);
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
                <Heart className="text-wellness-navy fill-red-500 text-red-500" size={24} />
                <h2 className="text-xl font-heading font-bold text-wellness-navy">Your Wishlist</h2>
                <span className="bg-wellness-green/10 text-wellness-green font-semibold text-xs px-2.5 py-1 rounded-full">
                  {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={() => {
                  setWishlistOpen(false);
                }}
                className="text-wellness-charcoal/50 hover:text-wellness-navy p-2 rounded-full hover:bg-wellness-gray-100 transition-colors"
                aria-label="Close Wishlist"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Items list */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {wishlistItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-wellness-gray-50 flex items-center justify-center mb-6 text-red-500/10 text-red-500">
                    <Heart size={32} />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-wellness-navy mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-sm text-wellness-charcoal/60 max-w-xs mb-8 font-medium">
                    Save your preferred formulas and therapies here to keep track of your wellness
                    routine.
                  </p>
                  <button
                    onClick={() => {
                      setWishlistOpen(false);
                    }}
                    className="bg-wellness-navy text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-wellness-green transition-colors cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-4 p-4 rounded-xl border border-wellness-gray-100 bg-white hover:border-wellness-gray-200 transition-all group"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 bg-wellness-gray-50 rounded-lg overflow-hidden shrink-0 border border-wellness-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover animate-in fade-in duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-grow flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-heading font-bold text-wellness-navy text-sm truncate group-hover:text-wellness-green transition-colors">
                              <Link
                                href={`/products/${product.id}`}
                                onClick={() => {
                                  setWishlistOpen(false);
                                }}
                              >
                                {product.name}
                              </Link>
                            </h4>
                            <button
                              onClick={() => {
                                removeFromWishlist(product.id);
                              }}
                              className="text-wellness-charcoal/40 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item from wishlist"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-bold text-wellness-navy bg-wellness-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                              {product.type}
                            </span>
                            <span className="text-[9px] font-semibold text-wellness-charcoal/50">
                              {product.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2">
                          <p className="text-sm font-bold text-wellness-navy">
                            ₹{product.price.toFixed(2)}
                          </p>

                          {/* Quick add and move to cart */}
                          <button
                            onClick={() => {
                              addToCart(product, 1);
                              removeFromWishlist(product.id);
                            }}
                            className="flex items-center gap-1 bg-wellness-green/10 hover:bg-wellness-green text-wellness-green hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <ShoppingCart size={12} />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with overall CTA */}
            {wishlistItems.length > 0 && (
              <div className="p-6 border-t border-wellness-gray-100 bg-wellness-white">
                <button
                  onClick={() => {
                    // Add all items to cart and clear wishlist
                    wishlistItems.forEach((item) => {
                      addToCart(item, 1);
                    });
                    wishlistItems.forEach((item) => {
                      removeFromWishlist(item.id);
                    });
                  }}
                  className="w-full bg-wellness-navy hover:bg-wellness-green text-white py-4 px-6 rounded-md font-semibold flex items-center justify-center gap-2 transition-all shadow-md group cursor-pointer"
                >
                  <span>Add All to Cart</span>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
