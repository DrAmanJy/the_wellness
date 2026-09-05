'use client';

import {
  Database,
  RefreshCw,
  Plus,
  X,
  Star,
  Flame,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React from 'react';

import type { NewProductFormState, QuickUpdateProductPayload } from '../../types';

import DropdownField from '@/components/ui/DropdownField';
import type { Product } from '@/lib/products';

interface ProductsTabProps {
  displayedProducts: Product[];
  loadProducts: () => Promise<void>;
  isRefreshingProducts: boolean;
  showAddProduct: boolean;
  setShowAddProduct: (show: boolean) => void;
  newProduct: NewProductFormState;
  setNewProduct: React.Dispatch<React.SetStateAction<NewProductFormState>>;
  categories: string[];
  newProductImages: string[];
  setNewProductImages: React.Dispatch<React.SetStateAction<string[]>>;
  handleAddProduct: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
  handleNewProductImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleImageDragStart: (idx: number) => void;
  handleImageDragOver: (e: React.DragEvent, idx: number) => void;
  handleImageDrop: (e: React.DragEvent, idx: number, isEditMode: boolean) => Promise<void>;
  draggedImgIdx: number | null;
  dragOverImgIdx: number | null;
  handleQuickUpdateProduct: (prodId: string, updates: QuickUpdateProductPayload) => Promise<void>;
  setEditingProduct: (prod: Product | null) => void;
  handleDeleteProduct: (id: string) => Promise<void>;
}

export default function ProductsTab({
  displayedProducts,
  loadProducts,
  isRefreshingProducts,
  showAddProduct,
  setShowAddProduct,
  newProduct,
  setNewProduct,
  categories,
  newProductImages,
  setNewProductImages,
  handleAddProduct,
  handleNewProductImagesChange,
  handleImageDragStart,
  handleImageDragOver,
  handleImageDrop,
  draggedImgIdx,
  dragOverImgIdx,
  handleQuickUpdateProduct,
  setEditingProduct,
  handleDeleteProduct,
}: ProductsTabProps) {
  return (
    <motion.div
      key="products"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-heading font-bold text-wellness-navy flex items-center gap-2">
            <Database size={18} className="text-wellness-green" />
            Product Inventory
          </h3>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-wellness-gray-50 text-wellness-charcoal/60 border-wellness-gray-200">
            {displayedProducts.length} Items
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              void loadProducts();
            }}
            disabled={isRefreshingProducts}
            className="bg-wellness-gray-100 hover:bg-wellness-gray-200 text-wellness-navy text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Product Data"
          >
            <RefreshCw size={14} className={isRefreshingProducts ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => {
              setShowAddProduct(!showAddProduct);
            }}
            className="bg-wellness-green hover:bg-wellness-navy text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            {showAddProduct ? <X size={14} /> : <Plus size={14} />}
            {showAddProduct ? 'Cancel Form' : 'Add New Product'}
          </button>
        </div>
      </div>

      {/* Add Product Form Card */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border border-wellness-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden"
          >
            <form
              onSubmit={(e) => {
                void handleAddProduct(e);
              }}
              className="space-y-6"
            >
              <h4 className="text-sm font-extrabold text-wellness-navy uppercase tracking-wider border-b border-wellness-gray-100 pb-2">
                Create New Clinical Therapy
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiospan-XR"
                    value={newProduct.name}
                    onChange={(e) => {
                      setNewProduct((prev: NewProductFormState) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <DropdownField
                    label="Category *"
                    options={[
                      ...categories
                        .filter((c) => c !== 'All')
                        .map((cat) => ({ value: cat, label: cat })),
                      { value: 'New Category', label: '+ Add New Category below' },
                    ]}
                    selectedValue={newProduct.category}
                    onChange={(val) => {
                      setNewProduct((prev: NewProductFormState) => ({ ...prev, category: val }));
                    }}
                    required
                  />
                  {newProduct.category === 'New Category' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom category"
                      onChange={(e) => {
                        setNewProduct((prev: NewProductFormState) => ({
                          ...prev,
                          category: e.target.value,
                        }));
                      }}
                      className="mt-2 w-full px-4 py-2.5 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold animate-in fade-in duration-200"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={newProduct.mrp}
                    onChange={(e) => {
                      setNewProduct((prev: NewProductFormState) => ({
                        ...prev,
                        mrp: e.target.value,
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500"
                    value={newProduct.sellingPrice}
                    onChange={(e) => {
                      setNewProduct((prev: NewProductFormState) => ({
                        ...prev,
                        sellingPrice: e.target.value,
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Inventory & Stock Section */}
              <div className="bg-wellness-gray-50 border border-wellness-gray-200 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-extrabold text-wellness-navy uppercase tracking-wider">
                    Inventory & Stock Control
                  </h5>
                  <span className="text-[10px] font-semibold text-wellness-charcoal/60">
                    {'Rules: Stock > 0 | Display Stock ≤ Available Stock'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                      Available Stock *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 100"
                      value={newProduct.availableQty}
                      onChange={(e) => {
                        setNewProduct((prev: NewProductFormState) => ({
                          ...prev,
                          availableQty: e.target.value,
                          inventoryQty: e.target.value,
                        }));
                      }}
                      className={`w-full px-4 py-3 rounded-lg border outline-none text-xs font-semibold ${
                        parseInt(newProduct.availableQty || '0', 10) <= 0
                          ? 'border-red-500 bg-red-50 focus:border-red-600 text-red-900'
                          : 'border-wellness-gray-200 bg-white focus:border-wellness-green'
                      }`}
                    />
                    <span className="text-[10px] text-wellness-charcoal/60 mt-1 block">
                      Unreserved units ready for immediate sale (min 1)
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                      Reserved Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 0"
                      value={newProduct.reservedQty}
                      onChange={(e) => {
                        setNewProduct((prev: NewProductFormState) => ({
                          ...prev,
                          reservedQty: e.target.value,
                        }));
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-purple-200 bg-purple-50/50 focus:border-purple-500 outline-none text-xs font-semibold text-purple-950"
                    />
                    <span className="text-[10px] text-wellness-charcoal/60 mt-1 block">
                      Units locked in active pending checkouts
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                      Store Display Stock *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 50"
                      value={newProduct.stockQty}
                      onChange={(e) => {
                        setNewProduct((prev: NewProductFormState) => ({
                          ...prev,
                          stockQty: e.target.value,
                        }));
                      }}
                      className={`w-full px-4 py-3 rounded-lg border outline-none text-xs font-semibold ${
                        parseInt(newProduct.stockQty || '0', 10) <= 0 ||
                        parseInt(newProduct.stockQty || '0', 10) >
                          parseInt(newProduct.availableQty || '0', 10)
                          ? 'border-red-500 bg-red-50 focus:border-red-600 text-red-900'
                          : 'border-wellness-gray-200 bg-white focus:border-wellness-green'
                      }`}
                    />
                    <span className="text-[10px] text-wellness-charcoal/60 mt-1 block">
                      Allocated stock units displayed to customers (min 1)
                    </span>
                  </div>
                </div>
                {(parseInt(newProduct.stockQty || '0', 10) <= 0 ||
                  parseInt(newProduct.availableQty || '0', 10) <= 0) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                    <span>⚠️</span>
                    <span>
                      Validation Error: Initial stock quantity must be at least 1 when creating a
                      product. Products cannot be added with 0 stock.
                    </span>
                  </div>
                )}
                {parseInt(newProduct.stockQty || '0', 10) >
                  parseInt(newProduct.availableQty || '0', 10) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                    <span>⚠️</span>
                    <span>
                      Validation Error: Store display stock ({newProduct.stockQty}) cannot exceed
                      available warehouse stock ({newProduct.availableQty}).
                    </span>
                  </div>
                )}
              </div>

              {/* Stock Status & Marketing Badges Section */}
              <div className="bg-wellness-gray-50 border border-wellness-gray-200 rounded-2xl p-4 space-y-4">
                <h5 className="text-xs font-extrabold text-wellness-navy uppercase tracking-wider">
                  Product Availability Status & Marketing Badges
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <DropdownField
                      label="Stock Status"
                      options={[
                        { value: 'in_stock', label: 'In Stock' },
                        { value: 'out_of_stock', label: 'Out of Stock' },
                        { value: 'discontinued', label: 'Discontinued' },
                      ]}
                      selectedValue={newProduct.stockStatus}
                      onChange={(val) => {
                        setNewProduct((prev: NewProductFormState) => ({
                          ...prev,
                          stockStatus: val as 'in_stock' | 'out_of_stock' | 'discontinued',
                        }));
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="newProductIsFeatured"
                      checked={newProduct.isFeatured}
                      onChange={(e) => {
                        setNewProduct((prev: NewProductFormState) => ({
                          ...prev,
                          isFeatured: e.target.checked,
                        }));
                      }}
                      className="w-4 h-4 rounded text-wellness-green accent-wellness-green cursor-pointer"
                    />
                    <label
                      htmlFor="newProductIsFeatured"
                      className="text-xs font-bold text-wellness-navy cursor-pointer"
                    >
                      Featured on Homepage
                    </label>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="newProductIsBestSeller"
                      checked={newProduct.isBestSeller}
                      onChange={(e) => {
                        setNewProduct((prev: NewProductFormState) => ({
                          ...prev,
                          isBestSeller: e.target.checked,
                        }));
                      }}
                      className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <label
                      htmlFor="newProductIsBestSeller"
                      className="text-xs font-bold text-wellness-navy cursor-pointer"
                    >
                      Best Seller Badge
                    </label>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="newProductIsNewest"
                      checked={newProduct.isNewest}
                      onChange={(e) => {
                        setNewProduct((prev: NewProductFormState) => ({
                          ...prev,
                          isNewest: e.target.checked,
                        }));
                      }}
                      className="w-4 h-4 rounded text-blue-500 accent-blue-500 cursor-pointer"
                    />
                    <label
                      htmlFor="newProductIsNewest"
                      className="text-xs font-bold text-wellness-navy cursor-pointer"
                    >
                      Newest Product Badge
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <DropdownField
                    label="Prescription Type"
                    options={[
                      {
                        value: 'Over-The-Counter (OTC)',
                        label: 'Over-The-Counter (OTC)',
                      },
                      { value: 'Prescription (Rx)', label: 'Prescription (Rx)' },
                    ]}
                    selectedValue={newProduct.type}
                    onChange={(val) => {
                      setNewProduct((prev: NewProductFormState) => ({ ...prev, type: val }));
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                    Image Source URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /images/products/cardio.png (leave blank for default)"
                    value={newProduct.image}
                    onChange={(e) => {
                      setNewProduct((prev: NewProductFormState) => ({
                        ...prev,
                        image: e.target.value,
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Image Upload Gallery (Min 2, Max 6) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider">
                  Upload Gallery Images * (At least 2 required, Max 6)
                </label>
                {newProductImages.length < 2 && (
                  <p className="text-[11px] text-amber-700 font-semibold">
                    ⚠️ At least 2 product images must be uploaded before submitting (
                    {newProductImages.length}/2 uploaded).
                  </p>
                )}
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="cursor-pointer border border-dashed border-wellness-gray-300 hover:border-wellness-green transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-1 bg-wellness-gray-50 text-center w-24 h-24 shrink-0">
                    <Plus size={20} className="text-wellness-navy/60" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-wellness-charcoal/60">
                      Upload
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        void handleNewProductImagesChange(e);
                      }}
                      className="hidden"
                    />
                  </label>

                  {newProductImages.map((img, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => {
                        handleImageDragStart(idx);
                      }}
                      onDragOver={(e) => {
                        handleImageDragOver(e, idx);
                      }}
                      onDrop={(e) => {
                        void handleImageDrop(e, idx, false);
                      }}
                      className={`relative w-24 h-24 rounded-xl overflow-hidden border transition-all cursor-move shrink-0 ${
                        draggedImgIdx === idx
                          ? 'opacity-40 border-dashed border-wellness-green scale-95'
                          : dragOverImgIdx === idx
                            ? 'border-2 border-wellness-green shadow-lg scale-105'
                            : 'border-wellness-gray-200 bg-wellness-gray-50 hover:border-wellness-green/50'
                      }`}
                      title="Drag to reorder"
                    >
                      <img
                        src={img}
                        alt={`Preview ${(idx + 1).toString()}`}
                        className="object-cover w-full h-full pointer-events-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setNewProductImages((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm focus:outline-none z-10"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-wellness-navy/80 text-[8px] font-extrabold uppercase text-center text-white py-0.5">
                        {idx === 0 ? 'Cover (Primary)' : `Pos ${(idx + 1).toString()}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide detailed clinical drug description..."
                  value={newProduct.description}
                  onChange={(e) => {
                    setNewProduct((prev: NewProductFormState) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                    Clinical Benefits (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rapid heart stability, Lowers LDL, Once-daily dosing"
                    value={newProduct.benefits}
                    onChange={(e) => {
                      setNewProduct((prev: NewProductFormState) => ({
                        ...prev,
                        benefits: e.target.value,
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                    Active Ingredients (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Atorvastatin 20mg, Cellulose matrix, Calcium"
                    value={newProduct.ingredients}
                    onChange={(e) => {
                      setNewProduct((prev: NewProductFormState) => ({
                        ...prev,
                        ingredients: e.target.value,
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                  Search Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. statin, heart, cholesterol, cardiovascular"
                  value={newProduct.tags}
                  onChange={(e) => {
                    setNewProduct((prev: NewProductFormState) => ({
                      ...prev,
                      tags: e.target.value,
                    }));
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                className="bg-wellness-navy hover:bg-wellness-green text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow"
              >
                Publish Product
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table/Grid list */}
      <div className="bg-white border border-wellness-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-wellness-gray-50 border-b border-wellness-gray-200 text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest">
                <th className="p-5">Product Details</th>
                <th className="p-5">Category</th>
                <th className="p-5">Price</th>
                <th className="p-5">Stock Status</th>
                <th className="p-5">Homepage & Badges</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wellness-gray-100 text-xs font-semibold text-wellness-navy">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-wellness-charcoal/50 text-xs font-semibold"
                  >
                    No products found. Add a new product to get started.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-wellness-gray-50/50 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-wellness-gray-100 overflow-hidden relative shrink-0 border border-wellness-gray-200">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm flex items-center gap-1.5">
                            {product.name}
                            <span
                              className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                product.type === 'Prescription (Rx)'
                                  ? 'bg-red-50 text-red-500 border border-red-100'
                                  : 'bg-wellness-navy/5 text-wellness-navy'
                              }`}
                            >
                              {product.type === 'Prescription (Rx)' ? 'Rx' : 'OTC'}
                            </span>
                          </h5>
                          <span className="text-[10px] text-wellness-charcoal/40 font-semibold font-mono">
                            ID: {product.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className="bg-wellness-green/10 text-wellness-green px-2.5 py-1 rounded text-[10px] font-extrabold uppercase w-fit">
                          {product.categoryName || product.category}
                        </span>
                        <span className="text-[11px] font-semibold text-wellness-charcoal/70">
                          {product.categoryName || product.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      {(() => {
                        const sp = product.sellingPrice ?? product.price;
                        const mrp = product.mrp || product.originalPrice || Math.round(sp * 1.25);
                        const discount = mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;
                        return (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-sm text-wellness-navy">
                              ₹{sp.toLocaleString('en-IN')}
                            </span>
                            {mrp > sp && (
                              <span className="text-xs text-wellness-charcoal/40 line-through font-semibold">
                                ₹{mrp.toLocaleString('en-IN')}
                              </span>
                            )}
                            {discount > 0 && (
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    {/* Stock Status Column */}
                    <td className="p-5">
                      <select
                        value={product.stockStatus ?? 'in_stock'}
                        onChange={(e) => {
                          void handleQuickUpdateProduct(product.id, {
                            stockStatus: e.target.value as
                              'in_stock' | 'out_of_stock' | 'discontinued',
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border outline-none cursor-pointer ${
                          (product.stockStatus ?? 'in_stock') === 'in_stock'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : (product.stockStatus ?? 'in_stock') === 'out_of_stock'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </td>
                    {/* Homepage & Badges Column */}
                    <td className="p-5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            void handleQuickUpdateProduct(product.id, {
                              isFeatured: !product.isFeatured,
                            });
                          }}
                          className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border ${
                            product.isFeatured
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-wellness-gray-50 text-wellness-charcoal/40 border-wellness-gray-200 hover:border-emerald-300'
                          }`}
                          title="Toggle Homepage Featured"
                        >
                          <Star size={10} className={product.isFeatured ? 'fill-current' : ''} />
                          Featured
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleQuickUpdateProduct(product.id, {
                              isBestSeller: !product.isBestSeller,
                            });
                          }}
                          className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border ${
                            product.isBestSeller
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-wellness-gray-50 text-wellness-charcoal/40 border-wellness-gray-200 hover:border-amber-300'
                          }`}
                          title="Toggle Best Seller Badge"
                        >
                          <Flame size={10} className={product.isBestSeller ? 'fill-current' : ''} />
                          Best Seller
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleQuickUpdateProduct(product.id, {
                              isNewest: !product.isNewest,
                            });
                          }}
                          className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border ${
                            product.isNewest
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-wellness-gray-50 text-wellness-charcoal/40 border-wellness-gray-200 hover:border-blue-300'
                          }`}
                          title="Toggle Newest Product Badge"
                        >
                          <Sparkles size={10} className={product.isNewest ? 'fill-current' : ''} />
                          Newest
                        </button>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                          }}
                          className="text-wellness-navy hover:text-wellness-green p-1.5 rounded hover:bg-wellness-navy/5 transition-colors cursor-pointer"
                          title="Edit Product Details"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => {
                            void handleDeleteProduct(product.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
