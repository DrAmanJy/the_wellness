'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { Product } from '@/lib/products';

type WishlistContextType = {
  wishlistItems: Product[];
  isWishlistOpen: boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: () => void;
  setWishlistOpen: (isOpen: boolean) => void;
  toggleProductInWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('wellness_wishlist');
      if (storedWishlist) {
        setWishlistItems(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('wellness_wishlist', JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlistItems, isInitialized]);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === product.id);
      if (exists) return prevItems;
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const toggleWishlist = () => {
    setIsWishlistOpen((prev) => !prev);
  };

  const setWishlistOpen = (isOpen: boolean) => {
    setIsWishlistOpen(isOpen);
  };

  const toggleProductInWishlist = (product: Product) => {
    setWishlistItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === product.id);
      if (exists) {
        return prevItems.filter((item) => item.id !== product.id);
      }
      return [...prevItems, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isWishlistOpen,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        setWishlistOpen,
        toggleProductInWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
