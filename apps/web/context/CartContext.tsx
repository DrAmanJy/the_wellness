'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { Product } from '@/lib/products';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void> | void;
  removeFromCart: (productId: string) => Promise<void> | void;
  updateQuantity: (productId: string, quantity: number) => Promise<void> | void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  cartCount: number;
  cartSubtotal: number;
  hasRxItems: boolean;
  cartId: string | null;
  isLoading: boolean;
};

type ApiCartResponseItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    sellingPrice?: string | number;
    price?: string | number;
    categoryName?: string;
    primaryImage?: string;
    type?: string;
    description?: string;
    stockQty?: number;
    availableQty?: number;
    stockStatus?: string;
  } | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const isUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Helper to load all catalog products
function getAllCatalogProducts(): Product[] {
  return [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [_isInitialized, setIsInitialized] = useState(false);

  const saveCartId = (id: string) => {
    setCartId(id);
    try {
      localStorage.setItem('wellness_cart_id', id);
    } catch (e) {
      console.error('Failed to save cart_id to localStorage:', e);
    }
  };

  const getHeaders = (activeCartId?: string | null): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const currentId = activeCartId !== undefined ? activeCartId : cartId;
    if (currentId) {
      headers['x-cart-id'] = currentId;
    }
    return headers;
  };

  const fetchCartFromApi = useCallback(async () => {
    let storedCartId: string | null = null;
    try {
      storedCartId = localStorage.getItem('wellness_cart_id');
      if (storedCartId) {
        setCartId(storedCartId);
      }
    } catch (e) {
      console.error('Failed to read cart_id from localStorage:', e);
    }

    try {
      const headers: Record<string, string> = {};
      if (storedCartId) {
        headers['x-cart-id'] = storedCartId;
      }

      const res = await fetch(`${API_BASE}/api/cart`, {
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: {
            id?: string;
            items?: ApiCartResponseItem[];
          };
        };
        if (json.success && json.data) {
          if (json.data.id) {
            saveCartId(json.data.id);
          }
          if (Array.isArray(json.data.items) && json.data.items.length > 0) {
            const allProducts = getAllCatalogProducts();

            const apiItems: CartItem[] = json.data.items.map((item) => {
              const matchedProduct = allProducts.find((p) => p.id === item.productId);

              const rawSp = item.product?.sellingPrice ?? item.product?.price;
              const apiPrice = typeof rawSp === 'string' ? parseFloat(rawSp) : rawSp || 0;

              const finalPrice =
                matchedProduct && matchedProduct.price > 0
                  ? matchedProduct.price
                  : apiPrice > 0
                    ? apiPrice
                    : 0;

              const productType =
                matchedProduct?.type ||
                (item.product?.type === 'Prescription (Rx)'
                  ? ('Prescription (Rx)' as const)
                  : ('Over-The-Counter (OTC)' as const));

              const itemStockQty =
                item.product?.stockQty ??
                item.product?.availableQty ??
                matchedProduct?.stockQty ??
                matchedProduct?.availableQty ??
                100;
              const itemAvailableQty =
                item.product?.availableQty ??
                item.product?.stockQty ??
                matchedProduct?.availableQty ??
                matchedProduct?.stockQty ??
                100;
              const itemStockStatus =
                item.product?.stockStatus ?? (itemAvailableQty <= 0 ? 'out_of_stock' : 'in_stock');

              return {
                product: matchedProduct
                  ? {
                      ...matchedProduct,
                      price: finalPrice,
                      stockQty: itemStockQty,
                      availableQty: itemAvailableQty,
                      stockStatus: itemStockStatus as 'in_stock' | 'out_of_stock' | 'discontinued',
                    }
                  : {
                      id: item.productId,
                      name: item.product?.name || 'Therapeutic Product',
                      price: finalPrice,
                      category: item.product?.categoryName || 'General Therapeutics',
                      type: productType,
                      image:
                        item.product?.primaryImage ||
                        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
                      description: item.product?.description || '',
                      ingredients: [],
                      benefits: [],
                      stockQty: itemStockQty,
                      availableQty: itemAvailableQty,
                      stockStatus: itemStockStatus as 'in_stock' | 'out_of_stock' | 'discontinued',
                    },
                quantity: item.quantity,
              };
            });

            setCartItems((prevItems) => {
              return apiItems.map((newItem) => {
                if (newItem.product.price === 0) {
                  const existingLocal = prevItems.find((p) => p.product.id === newItem.product.id);
                  if (existingLocal && existingLocal.product.price > 0) {
                    return {
                      ...newItem,
                      product: {
                        ...newItem.product,
                        price: existingLocal.product.price,
                      },
                    };
                  }
                }
                return newItem;
              });
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching cart from API:', err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    void fetchCartFromApi();
  }, [fetchCartFromApi]);

  const addToCart = async (product: Product, quantity = 1) => {
    const availableStock = product.availableQty ?? product.inventoryQty ?? product.stockQty ?? 0;
    const isOutOfStock = availableStock <= 0 || product.stockStatus === 'out_of_stock';

    if (isOutOfStock) {
      alert(`Sorry, "${product.name}" is currently out of stock.`);
      return;
    }

    const existingItem = cartItems.find((item) => item.product.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const desiredTotal = currentQty + quantity;

    if (desiredTotal > availableStock) {
      alert(
        `Cannot add more. Only ${String(availableStock)} unit(s) available in stock for "${product.name}".`,
      );
      return;
    }

    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.product.id === product.id);
      if (itemExists) {
        return prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...prevItems, { product, quantity }];
    });
    setIsCartOpen(true);

    if (isUUID(product.id)) {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/api/cart/items`, {
          method: 'POST',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({ productId: product.id, quantity }),
        });

        if (res.ok) {
          const json = (await res.json()) as {
            success?: boolean;
            data?: { id?: string };
          };
          if (json.data?.id) {
            saveCartId(json.data.id);
          }
        }
      } catch (err) {
        console.error('Failed to sync added item with API cart:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));

    if (isUUID(productId)) {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/api/cart/items/${productId}`, {
          method: 'DELETE',
          headers: getHeaders(),
          credentials: 'include',
        });

        if (res.ok) {
          const json = (await res.json()) as {
            success?: boolean;
            data?: { id?: string };
          };
          if (json.success && json.data?.id) {
            saveCartId(json.data.id);
          }
        }
      } catch (err) {
        console.error('API Error removing cart item:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const item = cartItems.find((i) => i.product.id === productId);
    if (item) {
      const stock =
        item.product.availableQty ?? item.product.inventoryQty ?? item.product.stockQty ?? 0;
      if (quantity > stock) {
        alert(
          `Cannot increase quantity. Maximum available stock for "${item.product.name}" is ${String(stock)} unit(s).`,
        );
        quantity = stock;
      }
    }

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.product.id === productId ? { ...cartItem, quantity } : cartItem,
      ),
    );

    if (isUUID(productId)) {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/api/cart/items/${productId}`, {
          method: 'PATCH',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({ quantity }),
        });

        if (res.ok) {
          const json = (await res.json()) as {
            success?: boolean;
            data?: { id?: string };
          };
          if (json.success && json.data?.id) {
            saveCartId(json.data.id);
          }
        }
      } catch (err) {
        console.error('API Error updating cart item quantity:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const setCartOpen = (isOpen: boolean) => {
    setIsCartOpen(isOpen);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const hasRxItems = cartItems.some((item) => item.product.type === 'Prescription (Rx)');

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        setCartOpen,
        cartCount,
        cartSubtotal,
        hasRxItems,
        cartId,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
