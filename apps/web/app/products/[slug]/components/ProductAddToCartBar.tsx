'use client';

import { AlertCircle, FileText, Minus, Plus, ShoppingCart } from 'lucide-react';
import React from 'react';

import type { Product } from '@/lib/products';

interface ProductAddToCartBarProps {
  product: Product;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function ProductAddToCartBar({
  product,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
}: ProductAddToCartBarProps) {
  const stock = product.availableQty ?? product.inventoryQty ?? product.stockQty ?? 0;
  const isOutOfStock = stock <= 0 || product.stockStatus === 'out_of_stock';
  const isLowStock = !isOutOfStock && stock <= 5;

  return (
    <>
      {/* Stock Availability Banner */}
      {isOutOfStock ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">
              Out of Stock
            </h4>
            <p className="text-xs text-red-700 font-medium mt-0.5">
              This product is currently unavailable for order.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-1 rounded-full">
            0 Units
          </span>
        </div>
      ) : isLowStock ? (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Hurry, Low Stock!
            </h4>
            <p className="text-xs text-amber-700 font-medium mt-0.5">
              Only {stock} unit(s) left in stock. Order soon.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white px-2.5 py-1 rounded-full">
            {stock} Left
          </span>
        </div>
      ) : (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mb-6 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              In Stock
            </h4>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">
              {stock} units available for dispatch.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full">
            Available
          </span>
        </div>
      )}

      {/* Cart Actions */}
      <div className="border-y border-wellness-gray-200 py-6 mb-10 flex flex-col sm:flex-row sm:items-end gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-wellness-charcoal/50 uppercase tracking-wider">
            Quantity
          </span>
          <div className="flex items-center border border-wellness-gray-200 rounded bg-white w-fit">
            <button
              disabled={isOutOfStock}
              onClick={() => {
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className={`px-3 py-2 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-wellness-gray-100 transition-colors ${
                isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
              type="button"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="px-4 text-sm font-bold text-wellness-navy min-w-[30px] text-center">
              {isOutOfStock ? 0 : quantity}
            </span>
            <button
              disabled={isOutOfStock}
              onClick={() => {
                setQuantity((q) => Math.min(stock, q + 1));
              }}
              className={`px-3 py-2 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-wellness-gray-100 transition-colors ${
                isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
              type="button"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex-grow flex flex-col sm:flex-row gap-3">
          <button
            disabled={isOutOfStock}
            onClick={onAddToCart}
            className={`flex-grow px-6 py-3.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-sm ${
              isOutOfStock
                ? 'bg-wellness-gray-200 text-wellness-charcoal/40 border border-wellness-gray-300 cursor-not-allowed'
                : 'bg-wellness-green hover:bg-wellness-navy text-white cursor-pointer'
            }`}
          >
            <ShoppingCart size={18} />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button
            disabled={isOutOfStock}
            onClick={onBuyNow}
            className={`flex-grow px-6 py-3.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-sm ${
              isOutOfStock
                ? 'bg-wellness-gray-200 text-wellness-charcoal/40 border border-wellness-gray-300 cursor-not-allowed'
                : 'bg-wellness-navy hover:bg-wellness-green text-white cursor-pointer'
            }`}
          >
            {isOutOfStock ? 'Unavailable' : 'Buy Now'}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button className="bg-wellness-gray-100 text-wellness-navy border border-wellness-gray-200 px-8 py-4 rounded-md font-semibold hover:bg-wellness-gray-200 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer text-sm">
          <FileText size={20} />
          Prescribing Information
        </button>
        {product.type === 'Prescription (Rx)' && (
          <button className="bg-white text-wellness-navy border border-wellness-gray-200 px-8 py-4 rounded-md font-semibold hover:bg-wellness-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm">
            <AlertCircle size={20} />
            Important Safety Info
          </button>
        )}
      </div>
    </>
  );
}
